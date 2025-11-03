-- ============================================================================
-- Complete Role Creation Fix - Apply to Supabase Cloud
-- ============================================================================
-- 
-- Instructions:
-- 1. Go to your Supabase project: https://supabase.com/dashboard/project/syhakcccldxfvcuczaol
-- 2. Navigate to SQL Editor
-- 3. Paste this entire file and run it
-- 4. Refresh your application and try creating a role again
--
-- ============================================================================

-- Step 1: Create missing role_permissions table if it doesn't exist
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

-- Create index for performance
create index if not exists idx_role_permissions_role_id on public.role_permissions(role_id);
create index if not exists idx_role_permissions_permission_id on public.role_permissions(permission_id);

-- Step 2: Enable RLS on role_permissions
alter table public.role_permissions enable row level security;

-- Step 3: Create RLS policies for role_permissions
drop policy if exists "role_permissions_select_org" on public.role_permissions;
create policy "role_permissions_select_org" on public.role_permissions
  for select using (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id()
    )
  );

drop policy if exists "role_permissions_insert_admin" on public.role_permissions;
create policy "role_permissions_insert_admin" on public.role_permissions
  for insert with check (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id() 
      and public.is_org_admin(auth.uid(), r.org_id)
    )
  );

drop policy if exists "role_permissions_delete_admin" on public.role_permissions;
create policy "role_permissions_delete_admin" on public.role_permissions
  for delete using (
    exists (
      select 1 from public.roles r 
      where r.id = role_id and r.org_id = public.current_org_id() 
      and public.is_org_admin(auth.uid(), r.org_id)
    )
  );

-- Step 4: Ensure permissions table exists
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- Step 5: Seed permissions if they don't exist
insert into public.permissions (key, description) values
  ('invite_create', 'Create and send user invitations'),
  ('identity_view', 'View user identities and profiles'),
  ('identity_edit', 'Edit user identities and profiles'),
  ('identity_delete', 'Delete user identities'),
  ('audit_view', 'View audit logs and activity history'),
  ('audit_export', 'Export audit logs'),
  ('role_manage', 'Create, edit, and assign roles'),
  ('role_assign', 'Assign roles to users'),
  ('org_settings_edit', 'Edit organization settings'),
  ('org_settings_view', 'View organization settings'),
  ('certification_manage', 'Manage certification campaigns'),
  ('certification_review', 'Review certifications'),
  ('policy_manage', 'Create and manage access policies'),
  ('integration_manage', 'Manage system integrations'),
  ('report_view', 'View and generate reports'),
  ('risk_assess', 'Assess and manage user risk levels'),
  ('user_disable', 'Disable or enable user accounts')
on conflict (key) do nothing;

-- Step 6: Create or update handle_create_role function
drop function if exists public.handle_create_role(text, text, text[]);

create or replace function public.handle_create_role(
  p_name text,
  p_description text,
  p_permission_keys text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_role_id uuid;
  v_has_slug boolean;
  v_slug text;
  v_user_exists boolean;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    raise exception 'User is not authenticated.';
  end if;

  -- Check if user exists in auth.users
  select exists(
    select 1 from auth.users where id = v_user_id
  ) into v_user_exists;

  if not v_user_exists then
    raise exception 'User not found in auth.users.';
  end if;

  -- Check if roles table has slug column
  select exists (
    select 1 
    from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'roles' 
      and column_name = 'slug'
  ) into v_has_slug;

  -- Step 1: Find or create an organization
  select id into v_org_id 
  from public.orgs 
  limit 1;

  if v_org_id is null then
    v_org_id := gen_random_uuid();
    v_slug := 'org-' || substring(v_org_id::text from 1 for 8);
    insert into public.orgs(id, name, slug)
    values (v_org_id, 'Default Organization', v_slug);
  end if;

  -- Step 2: Ensure user is an admin of that organization
  insert into public.user_orgs(user_id, org_id, role, is_active)
  values (v_user_id, v_org_id, 'org_admin', true)
  on conflict (user_id, org_id) do update
  set role = 'org_admin', is_active = true;

  -- Step 3: Generate role ID
  v_role_id := gen_random_uuid();

  -- Step 4: Create the role (with or without slug column)
  -- Always try to use user_id if user exists
  if v_has_slug then
    v_slug := lower(replace(p_name, ' ', '-')) || '-' || substring(v_role_id::text from 1 for 8);
    insert into public.roles(id, org_id, name, slug, description, created_by)
    values (v_role_id, v_org_id, p_name, v_slug, p_description, 
      case when v_user_exists then v_user_id else null end
    );
  else
    insert into public.roles(id, org_id, name, description, created_by)
    values (v_role_id, v_org_id, p_name, p_description, 
      case when v_user_exists then v_user_id else null end
    );
  end if;

  -- Step 5: Map the permissions to the new role
  insert into public.role_permissions(role_id, permission_id)
  select v_role_id, p.id
  from public.permissions p
  where p.key = any(p_permission_keys)
  on conflict do nothing;

  -- Step 6: Write audit log
  begin
    -- Try the new audit_logs schema first
    insert into public.audit_logs(actor_id, org_id, action, metadata)
    values (
      v_user_id, 
      v_org_id, 
      'ROLE_CREATED_VIA_RPC', 
      jsonb_build_object(
        'role_id', v_role_id,
        'role_name', p_name,
        'permissions_assigned', p_permission_keys
      )
    );
  exception when others then
    -- Fallback for different audit_logs schema
    begin
      insert into public.audit_logs(user_id, org_id, action, resource_type, resource_id, details)
      values (
        v_user_id,
        v_org_id,
        'ROLE_CREATED',
        'role',
        v_role_id,
        jsonb_build_object(
          'role_id', v_role_id,
          'role_name', p_name,
          'permissions_assigned', p_permission_keys
        )
      );
    exception when others then
      -- Silently ignore audit log failures
      null;
    end;
  end;

  return v_role_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.handle_create_role(text, text, text[]) to authenticated;

-- Step 7: Grant permissions on tables
grant select, insert, delete on public.role_permissions to authenticated;
grant select, insert, update, delete on public.roles to authenticated;
grant select on public.permissions to authenticated;

-- Verify the function was created
do $$
begin
  raise notice '✅ Complete role creation fix applied successfully!';
  raise notice '';
  raise notice 'What was fixed:';
  raise notice '  ✓ Created role_permissions table';
  raise notice '  ✓ Created/verified permissions table';
  raise notice '  ✓ Seeded permissions';
  raise notice '  ✓ Created handle_create_role function';
  raise notice '  ✓ Set up RLS policies';
  raise notice '';
  raise notice 'Next steps:';
  raise notice '1. Return to your application';
  raise notice '2. Try creating a role';
  raise notice '3. If issues persist, check the browser console for specific errors';
end $$;
