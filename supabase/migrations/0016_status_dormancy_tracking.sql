-- Migration: Add status and dormancy tracking tables
-- This migration creates tables for org-level settings and user status overrides
-- to support automatic dormancy detection and manual status management

-- Table: Organization settings for dormancy thresholds
drop table if exists public.org_settings;
create table public.org_settings (
  org_id uuid primary key references public.orgs(id) on delete cascade,
  dormant_days int not null default 45 check (dormant_days > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Table: Manual user status overrides
drop table if exists public.user_status_overrides;
create table public.user_status_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  status text not null check (status in ('disabled', 'active_override')),
  reason text not null,
  set_by uuid not null references auth.users(id),
  set_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

-- Add status column to profiles table
alter table public.profiles 
add column if not exists status text not null default 'inactive' 
check (status in ('active', 'inactive', 'disabled', 'dormant'));

-- Indexes for performance
create index if not exists idx_org_settings_org_id on public.org_settings(org_id);
create index if not exists idx_user_status_overrides_user_org on public.user_status_overrides(user_id, org_id);
create index if not exists idx_user_status_overrides_org on public.user_status_overrides(org_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- RLS Policies

-- org_settings: Only org admins can read/write their org's settings
alter table public.org_settings enable row level security;

create policy "org_settings_select_policy" on public.org_settings
  for select using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "org_settings_insert_policy" on public.org_settings
  for insert with check (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "org_settings_update_policy" on public.org_settings
  for update using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "org_settings_delete_policy" on public.org_settings
  for delete using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

-- user_status_overrides: Only org admins can manage overrides for their org
alter table public.user_status_overrides enable row level security;

create policy "user_status_overrides_select_policy" on public.user_status_overrides
  for select using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "user_status_overrides_insert_policy" on public.user_status_overrides
  for insert with check (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "user_status_overrides_update_policy" on public.user_status_overrides
  for update using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "user_status_overrides_delete_policy" on public.user_status_overrides
  for delete using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

-- Function: Initialize org settings for existing organizations
create or replace function public.init_org_settings()
returns void as $$
begin
  insert into public.org_settings (org_id, dormant_days, updated_by)
  select 
    o.id,
    45, -- default dormant days
    auth.uid()
  from public.orgs o
  where not exists (
    select 1 from public.org_settings os 
    where os.org_id = o.id
  );
end;
$$ language plpgsql security definer;

-- Initialize settings for existing orgs
select public.init_org_settings();

-- Function: Update user status based on dormancy rules
create or replace function public.update_user_status(
  p_user_id uuid,
  p_org_id uuid,
  p_new_status text,
  p_reason text default 'automatic'
)
returns void as $$
declare
  old_status text;
begin
  -- Get current status
  select status into old_status
  from public.profiles
  where id = p_user_id;
  
  -- Update status
  update public.profiles
  set status = p_new_status
  where id = p_user_id;
  
  -- Audit the change
  insert into public.audit_logs (
    user_id,
    org_id,
    action,
    resource_type,
    resource_id,
    details,
    correlation_id
  ) values (
    auth.uid(),
    p_org_id,
    'STATUS_CHANGE',
    'user',
    p_user_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', p_new_status,
      'reason', p_reason
    ),
    gen_random_uuid()
  );
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant select, insert, update, delete on public.org_settings to authenticated;
grant select, insert, update, delete on public.user_status_overrides to authenticated;
grant execute on function public.init_org_settings() to authenticated;
grant execute on function public.update_user_status(uuid, uuid, text, text) to authenticated;
