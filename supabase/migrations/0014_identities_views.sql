-- Idempotent views for org-scoped identities listing
-- Uses existing JWT/current_org_id() helpers and RLS

-- Helper function to get current org ID from JWT
create or replace function public.current_org_id()
returns uuid language sql stable as $$
  select nullif(public.get_jwt_claim('org_id'), '')::uuid
$$;

-- Helper function to get JWT claim
create or replace function public.get_jwt_claim(claim text)
returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')
$$;

-- View: Count role assignments per user for the active org
drop view if exists public.v_user_role_counts;
create view public.v_user_role_counts as
select 
  uo.user_id,
  coalesce(count(ra.role_id), 0)::int as role_count
from public.user_orgs uo
left join public.roles r on r.org_id = uo.org_id
left join public.role_assignments ra on ra.role_id = r.id
where uo.org_id = public.current_org_id() 
  and uo.is_active = true
group by uo.user_id;

-- View: Last login from auth.sessions (graceful handling if table doesn't exist)
drop view if exists public.v_user_last_login;
create view public.v_user_last_login as
select 
  uo.user_id,
  null::timestamptz as last_login_at  -- Placeholder: auth.sessions not accessible from public schema
from public.user_orgs uo
where uo.org_id = public.current_org_id() 
  and uo.is_active = true;

-- View: User flags (placeholder implementation)
drop view if exists public.v_user_flags;
create view public.v_user_flags as
select 
  uo.user_id,
  0::int as flags_count,
  false::boolean as has_dormant
from public.user_orgs uo
where uo.org_id = public.current_org_id() 
  and uo.is_active = true;

-- View: User risk (placeholder implementation)
drop view if exists public.v_user_risk;
create view public.v_user_risk as
select 
  uo.user_id,
  'low'::text as risk_level,
  0::int as risk_score
from public.user_orgs uo
where uo.org_id = public.current_org_id() 
  and uo.is_active = true;

-- Main identities view: join profiles with all supporting views
drop view if exists public.v_identities;
create view public.v_identities as
select 
  p.id,
  p.full_name as name,
  p.email,
  'Engineering'::text as department,  -- Placeholder: will be moved to attributes later
  null::text as manager_name,  -- Placeholder: no manager_id in profiles yet
  'active'::text as status,  -- Placeholder: will be added to profiles later
  r.risk_level,
  r.risk_score,
  rc.role_count,
  ll.last_login_at,
  f.flags_count,
  f.has_dormant,
  (coalesce(extract(day from (now() - ll.last_login_at)), 0) > 30) as dormant
from public.profiles p
join public.user_orgs uo on uo.user_id = p.id
left join public.v_user_role_counts rc on rc.user_id = p.id
left join public.v_user_last_login ll on ll.user_id = p.id
left join public.v_user_flags f on f.user_id = p.id
left join public.v_user_risk r on r.user_id = p.id
where uo.org_id = public.current_org_id() 
  and uo.is_active = true;

-- Enable RLS on views (inherits from underlying tables)
-- Views automatically inherit RLS from their underlying tables
-- Additional security: ensure views are only accessible within org context

-- Grant select permissions to authenticated users
grant select on public.v_user_role_counts to authenticated;
grant select on public.v_user_last_login to authenticated;
grant select on public.v_user_flags to authenticated;
grant select on public.v_user_risk to authenticated;
grant select on public.v_identities to authenticated;
