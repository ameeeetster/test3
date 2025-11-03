-- Migration: Create RBAC (Role-Based Access Control) schema
-- This migration creates the complete RBAC system with roles, permissions, and assignments

-- Table: Roles - defines roles within an organization
drop table if exists public.roles cascade;
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, name)
);

-- Table: Permissions - global permission definitions
drop table if exists public.permissions cascade;
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- Table: Role Permissions - links roles to their permissions
drop table if exists public.role_permissions cascade;
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

-- Table: Role Assignments - assigns roles to users
drop table if exists public.role_assignments cascade;
create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  unique(user_id, org_id, role_id)
);

-- Indexes for performance
create index if not exists idx_roles_org_id on public.roles(org_id);
create index if not exists idx_roles_name on public.roles(name);
create index if not exists idx_permissions_key on public.permissions(key);
create index if not exists idx_role_permissions_role_id on public.role_permissions(role_id);
create index if not exists idx_role_permissions_permission_id on public.role_permissions(permission_id);
create index if not exists idx_role_assignments_user_org on public.role_assignments(user_id, org_id);
create index if not exists idx_role_assignments_role_id on public.role_assignments(role_id);
create index if not exists idx_role_assignments_org_id on public.role_assignments(org_id);
create index if not exists idx_role_assignments_active on public.role_assignments(is_active);

-- RLS Policies

-- roles: Only org admins can manage roles for their org
alter table public.roles enable row level security;

create policy "roles_select_org" on public.roles
  for select using (
    org_id = public.current_org_id()
  );

create policy "roles_insert_admin" on public.roles
  for insert with check (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "roles_update_admin" on public.roles
  for update using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "roles_delete_admin" on public.roles
  for delete using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

-- permissions: Read-only for all authenticated users
alter table public.permissions enable row level security;

create policy "permissions_select_all" on public.permissions
  for select using (true);

-- role_permissions: Only org admins can manage role permissions
alter table public.role_permissions enable row level security;

create policy "role_permissions_select_org" on public.role_permissions
  for select using (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id()
    )
  );

create policy "role_permissions_insert_admin" on public.role_permissions
  for insert with check (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id() 
      and public.is_org_admin(auth.uid(), r.org_id)
    )
  );

create policy "role_permissions_delete_admin" on public.role_permissions
  for delete using (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id() 
      and public.is_org_admin(auth.uid(), r.org_id)
    )
  );

-- role_assignments: Only org admins can manage role assignments
alter table public.role_assignments enable row level security;

create policy "role_assignments_select_org" on public.role_assignments
  for select using (
    org_id = public.current_org_id()
  );

create policy "role_assignments_insert_admin" on public.role_assignments
  for insert with check (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "role_assignments_update_admin" on public.role_assignments
  for update using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

create policy "role_assignments_delete_admin" on public.role_assignments
  for delete using (
    org_id = public.current_org_id() and 
    public.is_org_admin(auth.uid(), org_id)
  );

-- Functions for RBAC management

-- Function: Create role with permissions
create or replace function public.create_role(
  p_name text,
  p_description text,
  p_permission_keys text[]
)
returns uuid as $$
declare
  role_id uuid;
  permission_id uuid;
  permission_key text;
begin
  -- Create the role
  insert into public.roles (org_id, name, description, created_by)
  values (public.current_org_id(), p_name, p_description, auth.uid())
  returning id into role_id;
  
  -- Add permissions to the role
  foreach permission_key in array p_permission_keys
  loop
    select id into permission_id
    from public.permissions
    where key = permission_key;
    
    if permission_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (role_id, permission_id)
      on conflict (role_id, permission_id) do nothing;
    end if;
  end loop;
  
  -- Audit log
  insert into public.audit_logs (
    user_id, org_id, action, resource_type, resource_id, details
  ) values (
    auth.uid(), public.current_org_id(), 'ROLE_CREATED', 'role', role_id,
    jsonb_build_object('role_name', p_name, 'permissions', p_permission_keys)
  );
  
  return role_id;
end;
$$ language plpgsql security definer;

-- Function: Assign role to user
create or replace function public.assign_role(
  p_user_id uuid,
  p_role_id uuid,
  p_expires_at timestamptz default null
)
returns uuid as $$
declare
  assignment_id uuid;
  role_name text;
  user_email text;
begin
  -- Verify role belongs to current org
  if not exists (
    select 1 from public.roles 
    where id = p_role_id and org_id = public.current_org_id()
  ) then
    raise exception 'Role not found in current organization';
  end if;
  
  -- Get role name for audit
  select name into role_name from public.roles where id = p_role_id;
  
  -- Get user email for audit
  select email into user_email from public.profiles where id = p_user_id;
  
  -- Create assignment
  insert into public.role_assignments (
    user_id, org_id, role_id, assigned_by, expires_at
  )
  values (
    p_user_id, public.current_org_id(), p_role_id, auth.uid(), p_expires_at
  )
  on conflict (user_id, org_id, role_id) 
  do update set 
    assigned_by = excluded.assigned_by,
    assigned_at = now(),
    expires_at = excluded.expires_at,
    is_active = true
  returning id into assignment_id;
  
  -- Audit log
  insert into public.audit_logs (
    user_id, org_id, action, resource_type, resource_id, details
  ) values (
    auth.uid(), public.current_org_id(), 'ROLE_ASSIGNED', 'role_assignment', assignment_id,
    jsonb_build_object(
      'assigned_user_id', p_user_id,
      'assigned_user_email', user_email,
      'role_id', p_role_id,
      'role_name', role_name,
      'expires_at', p_expires_at
    )
  );
  
  return assignment_id;
end;
$$ language plpgsql security definer;

-- Function: Remove role from user
create or replace function public.remove_role(
  p_user_id uuid,
  p_role_id uuid
)
returns void as $$
declare
  role_name text;
  user_email text;
begin
  -- Get role name and user email for audit
  select r.name, p.email into role_name, user_email
  from public.roles r, public.profiles p
  where r.id = p_role_id and p.id = p_user_id;
  
  -- Remove assignment
  delete from public.role_assignments
  where user_id = p_user_id 
    and role_id = p_role_id 
    and org_id = public.current_org_id();
  
  -- Audit log
  insert into public.audit_logs (
    user_id, org_id, action, resource_type, resource_id, details
  ) values (
    auth.uid(), public.current_org_id(), 'ROLE_REMOVED', 'role_assignment', p_role_id,
    jsonb_build_object(
      'removed_user_id', p_user_id,
      'removed_user_email', user_email,
      'role_id', p_role_id,
      'role_name', role_name
    )
  );
end;
$$ language plpgsql security definer;

-- Grant permissions
grant select, insert, update, delete on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select, insert, delete on public.role_permissions to authenticated;
grant select, insert, update, delete on public.role_assignments to authenticated;
grant execute on function public.create_role(text, text, text[]) to authenticated;
grant execute on function public.assign_role(uuid, uuid, timestamptz) to authenticated;
grant execute on function public.remove_role(uuid, uuid) to authenticated;
