-- Fix Access Requests RLS Policies with Organization Scoping
-- Migration: 0031_fix_access_requests_rls.sql

-- Drop old permissive development policies
drop policy if exists access_requests_select_all on public.access_requests;
drop policy if exists access_requests_insert_all on public.access_requests;

-- Ensure helper function exists for getting current user's organization
create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid;
$$;

-- SELECT: Users can view requests in their organization
create policy access_requests_select_org
  on public.access_requests for select
  to authenticated 
  using (
    organization_id = current_org_id()
    or organization_id is null  -- Allow null during development/migration
  );

-- INSERT: Users can create requests in their organization
create policy access_requests_insert_org
  on public.access_requests for insert
  to authenticated 
  with check (
    organization_id = current_org_id()
    or organization_id is null  -- Allow null during development/migration
  );

-- UPDATE: Users can update requests in their organization
create policy access_requests_update_org
  on public.access_requests for update
  to authenticated 
  using (
    organization_id = current_org_id()
    or organization_id is null
  )
  with check (
    organization_id = current_org_id()
    or organization_id is null
  );

-- DELETE: Admins and request owners can delete
create policy access_requests_delete_authorized
  on public.access_requests for delete
  to authenticated 
  using (
    requester_id = auth.uid()
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Add helpful comment
comment on table public.access_requests is 'Access requests with organization-scoped RLS policies';
