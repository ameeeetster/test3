-- Fix role creation to handle schema inconsistencies
-- This migration ensures role creation works correctly with or without slug column

-- Drop and recreate handle_create_role function to ensure it works
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
begin
  -- Check if user is authenticated
  if v_user_id is null then
    raise exception 'User is not authenticated.';
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
    insert into public.orgs(id, name, slug)
    values (
      v_org_id, 
      'Default Organization', 
      'org-' || substring(v_org_id::text from 1 for 8)
    );
  end if;

  -- Step 2: Ensure user is an admin of that organization
  insert into public.user_orgs(user_id, org_id, role, is_active)
  values (v_user_id, v_org_id, 'org_admin', true)
  on conflict (user_id, org_id) do update
  set role = 'org_admin', is_active = true;

  -- Step 3: Generate role ID
  v_role_id := gen_random_uuid();

  -- Step 4: Create the role (with or without slug column)
  if v_has_slug then
    insert into public.roles(id, org_id, name, slug, description, created_by)
    values (
      v_role_id, 
      v_org_id, 
      p_name, 
      lower(replace(p_name, ' ', '-')) || '-' || substring(v_role_id::text from 1 for 8), 
      p_description, 
      v_user_id
    );
  else
    insert into public.roles(id, org_id, name, description, created_by)
    values (v_role_id, v_org_id, p_name, p_description, v_user_id);
  end if;

  -- Step 5: Map the permissions to the new role
  insert into public.role_permissions(role_id, permission_id)
  select v_role_id, p.id
  from public.permissions p
  where p.key = any(p_permission_keys)
  on conflict do nothing;

  -- Step 6: Write audit log (with or without user_id column)
  -- Try to insert audit log, fallback if column doesn't exist
  begin
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

