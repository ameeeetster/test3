-- Migration: Add helper functions for dormancy scanning
-- This migration creates SQL functions to support the dormancy-scan Edge Function

-- Function: Get users with their login status for dormancy scanning
create or replace function public.get_users_with_login_status(
  p_org_id uuid,
  p_dormant_days int
)
returns table (
  user_id uuid,
  org_id uuid,
  last_login_at timestamptz,
  current_status text,
  has_override boolean,
  override_status text
) as $$
begin
  return query
  select 
    uo.user_id,
    uo.org_id,
    vul.last_login_at,
    p.status as current_status,
    (uso.user_id is not null) as has_override,
    uso.status as override_status
  from public.user_orgs uo
  left join public.profiles p on p.id = uo.user_id
  left join public.v_user_last_login vul on vul.user_id = uo.user_id
  left join public.user_status_overrides uso on uso.user_id = uo.user_id and uso.org_id = uo.org_id
  where uo.org_id = p_org_id
    and uo.is_active = true;
end;
$$ language plpgsql security definer;

-- Function: Create status override for a user
create or replace function public.create_status_override(
  p_user_id uuid,
  p_org_id uuid,
  p_status text,
  p_reason text
)
returns void as $$
begin
  -- Validate status
  if p_status not in ('disabled', 'active_override') then
    raise exception 'Invalid status: %', p_status;
  end if;
  
  -- Insert or update override
  insert into public.user_status_overrides (
    user_id, org_id, status, reason, set_by
  ) values (
    p_user_id, p_org_id, p_status, p_reason, auth.uid()
  )
  on conflict (user_id, org_id) 
  do update set
    status = excluded.status,
    reason = excluded.reason,
    set_by = excluded.set_by,
    set_at = now();
    
  -- Update user status
  perform public.update_user_status(
    p_user_id, 
    p_org_id, 
    case when p_status = 'disabled' then 'disabled' else 'active' end,
    'manual_override: ' || p_reason
  );
end;
$$ language plpgsql security definer;

-- Function: Remove status override for a user
create or replace function public.remove_status_override(
  p_user_id uuid,
  p_org_id uuid
)
returns void as $$
begin
  -- Remove override
  delete from public.user_status_overrides
  where user_id = p_user_id and org_id = p_org_id;
  
  -- Recalculate status based on login activity
  perform public.recalculate_user_status(p_user_id, p_org_id);
end;
$$ language plpgsql security definer;

-- Function: Recalculate user status based on current rules
create or replace function public.recalculate_user_status(
  p_user_id uuid,
  p_org_id uuid
)
returns void as $$
declare
  dormant_days int;
  last_login_at timestamptz;
  new_status text;
begin
  -- Get org dormant threshold
  select os.dormant_days into dormant_days
  from public.org_settings os
  where os.org_id = p_org_id;
  
  -- Default to 45 days if not set
  if dormant_days is null then
    dormant_days := 45;
  end if;
  
  -- Get last login
  select vul.last_login_at into last_login_at
  from public.v_user_last_login vul
  where vul.user_id = p_user_id;
  
  -- Determine new status
  if last_login_at is null then
    new_status := 'inactive';
  elsif last_login_at < (now() - interval '1 day' * dormant_days) then
    new_status := 'dormant';
  else
    new_status := 'active';
  end if;
  
  -- Update status
  perform public.update_user_status(
    p_user_id, 
    p_org_id, 
    new_status,
    'recalculated'
  );
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function public.get_users_with_login_status(uuid, int) to service_role;
grant execute on function public.create_status_override(uuid, uuid, text, text) to authenticated;
grant execute on function public.remove_status_override(uuid, uuid) to authenticated;
grant execute on function public.recalculate_user_status(uuid, uuid) to authenticated;
