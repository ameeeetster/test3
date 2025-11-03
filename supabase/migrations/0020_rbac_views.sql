-- Migration: Create RBAC views for role and permission management
-- This migration creates views to aggregate user roles, role permissions, and effective permissions

-- View: User roles - aggregate all roles a user has in the current org
drop view if exists public.v_user_roles;
create view public.v_user_roles as
select 
  ra.user_id,
  ra.org_id,
  array_agg(r.name order by r.name) as role_names,
  array_agg(r.id order by r.name) as role_ids,
  count(*) as role_count
from public.role_assignments ra
join public.roles r on r.id = ra.role_id
where ra.org_id = public.current_org_id() 
  and ra.is_active = true
  and (ra.expires_at is null or ra.expires_at > now())
group by ra.user_id, ra.org_id;

-- View: Role permissions - aggregate permission keys for each role
drop view if exists public.v_role_permissions;
create view public.v_role_permissions as
select 
  rp.role_id,
  r.org_id,
  r.name as role_name,
  array_agg(p.key order by p.key) as permission_keys,
  array_agg(p.description order by p.key) as permission_descriptions,
  count(*) as permission_count
from public.role_permissions rp
join public.roles r on r.id = rp.role_id
join public.permissions p on p.id = rp.permission_id
where r.org_id = public.current_org_id()
group by rp.role_id, r.org_id, r.name;

-- View: Effective permissions - resolve user permissions by joining role assignments → role_permissions → permissions
drop view if exists public.v_effective_permissions;
create view public.v_effective_permissions as
select 
  ra.user_id,
  ra.org_id,
  array_agg(distinct p.key) as permissions,
  array_agg(distinct r.name) as roles,
  count(distinct p.key) as permission_count,
  count(distinct r.name) as role_count
from public.role_assignments ra
join public.roles r on r.id = ra.role_id
join public.role_permissions rp on rp.role_id = r.id
join public.permissions p on p.id = rp.permission_id
where ra.org_id = public.current_org_id()
  and ra.is_active = true
  and (ra.expires_at is null or ra.expires_at > now())
group by ra.user_id, ra.org_id;

-- View: User role assignments with details
drop view if exists public.v_user_role_assignments;
create view public.v_user_role_assignments as
select 
  ra.id as assignment_id,
  ra.user_id,
  ra.org_id,
  ra.role_id,
  ra.assigned_by,
  ra.assigned_at,
  ra.expires_at,
  ra.is_active,
  r.name as role_name,
  r.description as role_description,
  p.full_name as user_name,
  p.email as user_email,
  assigner.full_name as assigned_by_name,
  assigner.email as assigned_by_email,
  case 
    when ra.expires_at is not null and ra.expires_at <= now() then 'expired'
    when ra.is_active = false then 'inactive'
    else 'active'
  end as assignment_status
from public.role_assignments ra
join public.roles r on r.id = ra.role_id
left join public.profiles p on p.id = ra.user_id
left join public.profiles assigner on assigner.id = ra.assigned_by
where ra.org_id = public.current_org_id();

-- View: Role details with permission summary
drop view if exists public.v_role_details;
create view public.v_role_details as
select 
  r.id,
  r.org_id,
  r.name,
  r.description,
  r.created_by,
  r.created_at,
  r.updated_at,
  creator.full_name as created_by_name,
  creator.email as created_by_email,
  array_agg(distinct p.key) as permissions,
  array_agg(distinct p.description) as permission_descriptions,
  count(distinct p.key) as permission_count,
  count(distinct ra.user_id) as assigned_user_count
from public.roles r
left join public.role_permissions rp on rp.role_id = r.id
left join public.permissions p on p.id = rp.permission_id
left join public.role_assignments ra on ra.role_id = r.id and ra.is_active = true
left join public.profiles creator on creator.id = r.created_by
where r.org_id = public.current_org_id()
group by r.id, r.org_id, r.name, r.description, r.created_by, r.created_at, r.updated_at, 
         creator.full_name, creator.email;

-- View: Permission summary across all roles
drop view if exists public.v_permission_summary;
create view public.v_permission_summary as
select 
  p.id,
  p.key,
  p.description,
  count(distinct rp.role_id) as role_count,
  count(distinct ra.user_id) as user_count,
  array_agg(distinct r.name) as roles_using_permission
from public.permissions p
left join public.role_permissions rp on rp.permission_id = p.id
left join public.roles r on r.id = rp.role_id and r.org_id = public.current_org_id()
left join public.role_assignments ra on ra.role_id = r.id and ra.is_active = true
group by p.id, p.key, p.description;

-- Function: Check if user has specific permission
create or replace function public.user_has_permission(
  p_user_id uuid,
  p_permission_key text
)
returns boolean as $$
begin
  return exists (
    select 1
    from public.v_effective_permissions vep
    where vep.user_id = p_user_id
      and vep.org_id = public.current_org_id()
      and p_permission_key = any(vep.permissions)
  );
end;
$$ language plpgsql security definer;

-- Function: Get user's effective permissions
create or replace function public.get_user_permissions(
  p_user_id uuid default auth.uid()
)
returns table (
  permissions text[],
  roles text[]
) as $$
begin
  return query
  select 
    coalesce(vep.permissions, array[]::text[]) as permissions,
    coalesce(vep.roles, array[]::text[]) as roles
  from public.v_effective_permissions vep
  where vep.user_id = p_user_id
    and vep.org_id = public.current_org_id();
end;
$$ language plpgsql security definer;

-- Grant permissions on views
grant select on public.v_user_roles to authenticated;
grant select on public.v_role_permissions to authenticated;
grant select on public.v_effective_permissions to authenticated;
grant select on public.v_user_role_assignments to authenticated;
grant select on public.v_role_details to authenticated;
grant select on public.v_permission_summary to authenticated;

-- Grant permissions on functions
grant execute on function public.user_has_permission(uuid, text) to authenticated;
grant execute on function public.get_user_permissions(uuid) to authenticated;
