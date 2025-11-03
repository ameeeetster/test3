-- Real data support for Access tabs: applications and entitlements
-- Idempotent guards used where possible

-- 1) Applications catalog
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon text,
  category text,
  created_at timestamptz not null default now()
);

-- 2) Application ↔ Permission mapping
create table if not exists public.application_permissions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  unique(application_id, permission_id)
);

-- 3) Seed minimal applications
insert into public.applications (name, icon, category)
values
  ('Core IGA', '🛡️', 'Platform'),
  ('Identity', '👤', 'Directory'),
  ('Auditing', '🔍', 'Compliance')
on conflict (name) do nothing;

-- 4) Link existing permissions if present
-- Map known demo permissions to applications
with perms as (
  select id, key from public.permissions
)
insert into public.application_permissions (application_id, permission_id)
select a.id, p.id
from perms p
join public.applications a on (
  (p.key in ('invite_create', 'org_settings_edit', 'role_manage') and a.name = 'Core IGA') or
  (p.key like 'identity_%' and a.name = 'Identity') or
  (p.key like 'audit_%' and a.name = 'Auditing')
)
on conflict do nothing;

-- 5) Views for UI consumption
drop view if exists public.v_entitlements cascade;
create view public.v_entitlements as
select 
  p.id,
  p.key,
  p.description,
  coalesce(a.name, 'Unassigned') as app,
  coalesce(a.icon, '🔧') as app_icon,
  'Permission'::text as type,
  0::int as assigned,
  null::text as owner,
  'Medium'::text as risk,
  0::int as sod_conflicts
from public.permissions p
left join public.application_permissions ap on ap.permission_id = p.id
left join public.applications a on a.id = ap.application_id;

drop view if exists public.v_applications cascade;
create view public.v_applications as
select 
  a.id,
  a.name,
  a.icon,
  a.category,
  0::int as users,
  count(ap.permission_id)::int as roles, -- proxy: number of entitlements linked
  'Medium'::text as risk,
  'connected'::text as connector_status
from public.applications a
left join public.application_permissions ap on ap.application_id = a.id
group by a.id, a.name, a.icon, a.category;

-- 6) Grants and RLS (read for authenticated)
alter table public.applications enable row level security;
alter table public.application_permissions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='applications' and policyname='apps_select_all_auth'
  ) then
    create policy apps_select_all_auth on public.applications for select using (auth.uid() is not null);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='application_permissions' and policyname='app_perms_select_all_auth'
  ) then
    create policy app_perms_select_all_auth on public.application_permissions for select using (auth.uid() is not null);
  end if;
end $$;

grant select on public.applications to authenticated;
grant select on public.application_permissions to authenticated;
grant select on public.v_entitlements to authenticated;
grant select on public.v_applications to authenticated;


