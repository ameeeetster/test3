-- Migration: Update JWT enrichment to include roles and permissions
-- This migration enhances the existing JWT enrichment function to include RBAC data

-- Update the JWT enrichment function to include roles and permissions
create or replace function public.enrich_jwt_claims()
returns jsonb as $$
declare
  _user_id uuid;
  _org_id uuid;
  _is_admin boolean;
  _roles text[];
  _permissions text[];
  _enriched_claims jsonb;
begin
  -- Get current user and organization
  _user_id := auth.uid();
  _org_id := public.current_org_id();
  
  if _user_id is null or _org_id is null then
    return '{}'::jsonb;
  end if;
  
  -- Check if user is org admin
  _is_admin := public.is_org_admin(_user_id, _org_id);
  
  -- Get user's roles and permissions
  select 
    coalesce(roles, array[]::text[]),
    coalesce(permissions, array[]::text[])
  into _roles, _permissions
  from public.v_effective_permissions
  where user_id = _user_id and org_id = _org_id;
  
  -- Build enriched claims
  _enriched_claims := jsonb_build_object(
    'org_id', _org_id,
    'is_org_admin', _is_admin,
    'roles', _roles,
    'permissions', _permissions,
    'role_count', array_length(_roles, 1),
    'permission_count', array_length(_permissions, 1)
  );
  
  return _enriched_claims;
end;
$$ language plpgsql security definer;

-- Function: Get current user's RBAC context
create or replace function public.get_current_user_rbac()
returns table (
  user_id uuid,
  org_id uuid,
  is_admin boolean,
  roles text[],
  permissions text[],
  role_count int,
  permission_count int
) as $$
begin
  return query
  select 
    auth.uid() as user_id,
    public.current_org_id() as org_id,
    public.is_org_admin(auth.uid(), public.current_org_id()) as is_admin,
    coalesce(vep.roles, array[]::text[]) as roles,
    coalesce(vep.permissions, array[]::text[]) as permissions,
    coalesce(array_length(vep.roles, 1), 0) as role_count,
    coalesce(array_length(vep.permissions, 1), 0) as permission_count
  from public.v_effective_permissions vep
  where vep.user_id = auth.uid() 
    and vep.org_id = public.current_org_id();
end;
$$ language plpgsql security definer;

-- Function: Check if current user has specific permission
create or replace function public.current_user_has_permission(p_permission_key text)
returns boolean as $$
begin
  return public.user_has_permission(auth.uid(), p_permission_key);
end;
$$ language plpgsql security definer;

-- Function: Check if current user has any of the specified permissions
create or replace function public.current_user_has_any_permission(p_permission_keys text[])
returns boolean as $$
begin
  return exists (
    select 1
    from public.v_effective_permissions vep
    where vep.user_id = auth.uid()
      and vep.org_id = public.current_org_id()
      and vep.permissions && p_permission_keys
  );
end;
$$ language plpgsql security definer;

-- Function: Check if current user has all of the specified permissions
create or replace function public.current_user_has_all_permissions(p_permission_keys text[])
returns boolean as $$
begin
  return (
    select count(*) = array_length(p_permission_keys, 1)
    from public.v_effective_permissions vep
    where vep.user_id = auth.uid()
      and vep.org_id = public.current_org_id()
      and vep.permissions @> p_permission_keys
  );
end;
$$ language plpgsql security definer;

-- Function: Get user's role assignments with details
create or replace function public.get_user_role_assignments(p_user_id uuid default auth.uid())
returns table (
  assignment_id uuid,
  role_id uuid,
  role_name text,
  role_description text,
  assigned_at timestamptz,
  expires_at timestamptz,
  is_active boolean,
  assignment_status text
) as $$
begin
  return query
  select 
    vra.assignment_id,
    vra.role_id,
    vra.role_name,
    vra.role_description,
    vra.assigned_at,
    vra.expires_at,
    vra.is_active,
    vra.assignment_status
  from public.v_user_role_assignments vra
  where vra.user_id = p_user_id
    and vra.org_id = public.current_org_id()
  order by vra.assigned_at desc;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function public.enrich_jwt_claims() to authenticated;
grant execute on function public.get_current_user_rbac() to authenticated;
grant execute on function public.current_user_has_permission(text) to authenticated;
grant execute on function public.current_user_has_any_permission(text[]) to authenticated;
grant execute on function public.current_user_has_all_permissions(text[]) to authenticated;
grant execute on function public.get_user_role_assignments(uuid) to authenticated;
