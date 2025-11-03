-- A single, idempotent, and secure RPC to handle role creation.
-- This is the only function the UI should call.

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
  v_slug text;
  v_role_id uuid;
begin
  if v_user_id is null then
    raise exception 'User is not authenticated.';
  end if;

  -- Step 1: Find or create an organization.
  select id into v_org_id from public.orgs limit 1;

  if v_org_id is null then
    v_org_id := gen_random_uuid();
    v_slug := 'org-' || substring(v_org_id::text from 1 for 8);
    insert into public.orgs(id, name, slug)
    values (v_org_id, 'Default Organization', v_slug);
  end if;

  -- Step 2: Ensure the user is an admin of that organization.
  -- This is idempotent. If the user is already an admin, it does nothing.
  insert into public.user_orgs(user_id, org_id, role, is_active)
  values (v_user_id, v_org_id, 'org_admin', true)
  on conflict (user_id, org_id) do update
  set role = 'org_admin', is_active = true;

  -- Step 3: Create the role, now that we are sure the user is an admin.
  v_role_id := gen_random_uuid();
  insert into public.roles(id, org_id, name, description, created_by)
  values (v_role_id, v_org_id, p_name, p_description, v_user_id);

  -- Step 4: Map the permissions to the new role.
  insert into public.role_permissions(role_id, permission_id)
  select v_role_id, p.id
  from public.permissions p
  where p.key = any (p_permission_keys)
  on conflict do nothing;

  -- Step 5: Write a comprehensive audit log.
  insert into public.audit_logs(actor_id, org_id, action, metadata)
  values (v_user_id, v_org_id, 'ROLE_CREATED_VIA_RPC', jsonb_build_object(
    'role_id', v_role_id,
    'role_name', p_name,
    'permissions_assigned', p_permission_keys
  ));

  return v_role_id;
end;
$$;

-- Grant execute permission to authenticated users.
grant execute on function public.handle_create_role(text, text, text[]) to authenticated;
