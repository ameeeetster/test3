-- Migration: Update identities views to include status and dormancy tracking
-- This migration updates the existing identities views to include user status and dormant flags

-- Drop dependent views first
drop view if exists public.v_identities;
drop view if exists public.v_user_flags;

-- Update v_user_flags to include dormant status
create view public.v_user_flags as
select 
  uo.user_id,
  case 
    when p.status = 'dormant' then 1
    else 0
  end as flags_count,
  case 
    when p.status = 'dormant' then true
    else false
  end as has_dormant,
  p.status as user_status,
  case 
    when uso.user_id is not null then true
    else false
  end as has_status_override,
  case 
    when uso.status = 'disabled' then 'disabled'
    when uso.status = 'active_override' then 'active_override'
    else null
  end as override_status
from public.user_orgs uo
left join public.profiles p on p.id = uo.user_id
left join public.user_status_overrides uso on uso.user_id = uo.user_id and uso.org_id = uo.org_id
where uo.org_id = public.current_org_id() 
  and uo.is_active = true;

-- Update v_identities to include status and dormant information
drop view if exists public.v_identities;
create view public.v_identities as
select 
  p.id,
  p.full_name as name,
  p.email,
  null::text as department,  -- Placeholder - department not in schema yet
  null::text as manager_name,  -- Placeholder - manager not in schema yet
  p.status,
  vuf.has_dormant,
  vuf.flags_count,
  vuf.has_status_override,
  vuf.override_status,
  vur.risk_level,
  vur.risk_score,
  vrc.role_count,
  vul.last_login_at,
  case 
    when p.status = 'active' then 'Active'
    when p.status = 'inactive' then 'Inactive'
    when p.status = 'disabled' then 'Disabled'
    when p.status = 'dormant' then 'Dormant'
    else 'Unknown'
  end as status_display,
  case 
    when vuf.has_dormant then 'Dormant'
    when vuf.has_status_override and vuf.override_status = 'disabled' then 'Disabled'
    when vuf.has_status_override and vuf.override_status = 'active_override' then 'Active (Override)'
    when p.status = 'active' then 'Active'
    else 'Inactive'
  end as effective_status
from public.profiles p
left join public.user_orgs uo on uo.user_id = p.id and uo.org_id = public.current_org_id() and uo.is_active = true
-- left join public.profiles pm on pm.id = p.manager_user_id  -- Commented out - manager_user_id not in schema
left join public.v_user_role_counts vrc on vrc.user_id = p.id
left join public.v_user_last_login vul on vul.user_id = p.id
left join public.v_user_flags vuf on vuf.user_id = p.id
left join public.v_user_risk vur on vur.user_id = p.id
where uo.user_id is not null;

-- Create view for status overrides (admin only)
drop view if exists public.v_status_overrides;
create view public.v_status_overrides as
select 
  uso.user_id,
  uso.org_id,
  uso.status as override_status,
  uso.reason,
  uso.set_by,
  uso.set_at,
  p.full_name as user_name,
  p.email as user_email,
  setter.full_name as set_by_name,
  setter.email as set_by_email
from public.user_status_overrides uso
left join public.profiles p on p.id = uso.user_id
left join public.profiles setter on setter.id = uso.set_by
where uso.org_id = public.current_org_id();

-- Create view for organization settings (admin only)
drop view if exists public.v_org_settings;
create view public.v_org_settings as
select 
  os.org_id,
  os.dormant_days,
  os.updated_at,
  os.updated_by,
  p.full_name as updated_by_name,
  p.email as updated_by_email
from public.org_settings os
left join public.profiles p on p.id = os.updated_by
where os.org_id = public.current_org_id();

-- Grant permissions
grant select on public.v_user_flags to authenticated;
grant select on public.v_identities to authenticated;
grant select on public.v_status_overrides to authenticated;
grant select on public.v_org_settings to authenticated;
