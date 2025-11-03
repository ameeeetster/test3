-- Migration: Seed base permissions and roles for RBAC system
-- This migration creates the foundational permissions and roles for the IAM system

-- Insert base permissions
insert into public.permissions (key, description) values
  ('invite_create', 'Create and send user invitations'),
  ('identity_view', 'View user identities and profiles'),
  ('identity_edit', 'Edit user identities and profiles'),
  ('audit_view', 'View audit logs and activity history'),
  ('role_manage', 'Create, edit, and assign roles'),
  ('org_settings_edit', 'Edit organization settings'),
  ('user_disable', 'Disable or enable user accounts'),
  ('certification_manage', 'Manage certification campaigns'),
  ('policy_manage', 'Create and manage access policies'),
  ('integration_manage', 'Manage system integrations'),
  ('report_view', 'View and generate reports'),
  ('risk_assess', 'Assess and manage user risk levels')
on conflict (key) do nothing;

-- Function: Create base roles for an organization
create or replace function public.create_base_roles(p_org_id uuid)
returns void as $$
declare
  org_admin_role_id uuid;
  manager_role_id uuid;
  reviewer_role_id uuid;
begin
  -- Create Org Admin role
  insert into public.roles (org_id, name, description, created_by)
  values (p_org_id, 'Org Admin', 'Full administrative access to all organization features', null)
  returning id into org_admin_role_id;
  
  -- Assign all permissions to Org Admin
  insert into public.role_permissions (role_id, permission_id)
  select org_admin_role_id, id
  from public.permissions;
  
  -- Create Manager role
  insert into public.roles (org_id, name, description, created_by)
  values (p_org_id, 'Manager', 'Can manage users and view reports', null)
  returning id into manager_role_id;
  
  -- Assign specific permissions to Manager
  insert into public.role_permissions (role_id, permission_id)
  select manager_role_id, id
  from public.permissions
  where key in ('invite_create', 'identity_view', 'identity_edit', 'user_disable', 'report_view');
  
  -- Create Reviewer role
  insert into public.roles (org_id, name, description, created_by)
  values (p_org_id, 'Reviewer', 'Can view identities and audit logs for review purposes', null)
  returning id into reviewer_role_id;
  
  -- Assign specific permissions to Reviewer
  insert into public.role_permissions (role_id, permission_id)
  select reviewer_role_id, id
  from public.permissions
  where key in ('identity_view', 'audit_view', 'report_view');
  
  -- Audit log
  insert into public.audit_logs (
    user_id, org_id, action, resource_type, resource_id, details
  ) values (
    null, p_org_id, 'BASE_ROLES_CREATED', 'organization', p_org_id,
    jsonb_build_object(
      'roles_created', array['Org Admin', 'Manager', 'Reviewer'],
      'org_admin_role_id', org_admin_role_id,
      'manager_role_id', manager_role_id,
      'reviewer_role_id', reviewer_role_id
    )
  );
end;
$$ language plpgsql security definer;

-- Function: Assign Org Admin role to organization creator
create or replace function public.assign_org_admin_role(
  p_org_id uuid,
  p_user_id uuid
)
returns void as $$
declare
  org_admin_role_id uuid;
begin
  -- Get Org Admin role ID
  select id into org_admin_role_id
  from public.roles
  where org_id = p_org_id and name = 'Org Admin';
  
  if org_admin_role_id is null then
    raise exception 'Org Admin role not found for organization';
  end if;
  
  -- Assign the role
  insert into public.role_assignments (user_id, org_id, role_id, assigned_by)
  values (p_user_id, p_org_id, org_admin_role_id, null)
  on conflict (user_id, org_id, role_id) do nothing;
  
  -- Audit log
  insert into public.audit_logs (
    user_id, org_id, action, resource_type, resource_id, details
  ) values (
    null, p_org_id, 'ORG_ADMIN_ASSIGNED', 'role_assignment', org_admin_role_id,
    jsonb_build_object(
      'assigned_user_id', p_user_id,
      'role_name', 'Org Admin'
    )
  );
end;
$$ language plpgsql security definer;

-- Create base roles for existing organizations
do $$
declare
  org_record record;
begin
  for org_record in select id from public.orgs loop
    perform public.create_base_roles(org_record.id);
  end loop;
end $$;

-- Grant permissions
grant execute on function public.create_base_roles(uuid) to service_role;
grant execute on function public.assign_org_admin_role(uuid, uuid) to service_role;
