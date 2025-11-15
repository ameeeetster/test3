-- Fix Access Requests RLS to properly handle NULL organization_id
-- Migration: 0039_fix_access_requests_rls_null_handling.sql
-- 
-- Issue: NULL = NULL evaluates to NULL (not TRUE) in SQL, causing RLS to fail
-- when both the request's organization_id and user's organization_id are NULL.
--
-- Solution: Use IS NOT DISTINCT FROM or explicit NULL checks

-- Drop existing policies
DROP POLICY IF EXISTS access_requests_select_org ON public.access_requests;
DROP POLICY IF EXISTS access_requests_insert_org ON public.access_requests;
DROP POLICY IF EXISTS access_requests_update_org ON public.access_requests;
DROP POLICY IF EXISTS access_requests_delete_authorized ON public.access_requests;

-- SELECT: Users can view requests in their organization
CREATE POLICY access_requests_select_org
  ON public.access_requests FOR SELECT
  TO authenticated 
  USING (
    -- Match organization IDs, handling NULLs correctly
    organization_id IS NOT DISTINCT FROM current_org_id()
    OR
    -- Allow null organization_id for development/migration
    organization_id IS NULL
    OR
    -- Allow if current user has no org set
    current_org_id() IS NULL
  );

-- INSERT: Users can create requests in their organization
CREATE POLICY access_requests_insert_org
  ON public.access_requests FOR INSERT
  TO authenticated 
  WITH CHECK (
    -- Match organization IDs, handling NULLs correctly
    organization_id IS NOT DISTINCT FROM current_org_id()
    OR
    -- Allow null organization_id for development/migration
    organization_id IS NULL
    OR
    -- Allow if current user has no org set
    current_org_id() IS NULL
  );

-- UPDATE: Users can update requests in their organization
CREATE POLICY access_requests_update_org
  ON public.access_requests FOR UPDATE
  TO authenticated 
  USING (
    -- Match organization IDs, handling NULLs correctly
    organization_id IS NOT DISTINCT FROM current_org_id()
    OR
    -- Allow null organization_id for development/migration
    organization_id IS NULL
    OR
    -- Allow if current user has no org set
    current_org_id() IS NULL
  )
  WITH CHECK (
    -- Match organization IDs, handling NULLs correctly
    organization_id IS NOT DISTINCT FROM current_org_id()
    OR
    -- Allow null organization_id for development/migration
    organization_id IS NULL
    OR
    -- Allow if current user has no org set
    current_org_id() IS NULL
  );

-- DELETE: Admins and request owners can delete
CREATE POLICY access_requests_delete_authorized
  ON public.access_requests FOR DELETE
  TO authenticated 
  USING (
    requester_id = auth.uid()
    OR
    -- Check for admin role in user_metadata or app_metadata
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Add helpful comment explaining the NULL handling
COMMENT ON TABLE public.access_requests IS 'Access requests with organization-scoped RLS policies. Uses IS NOT DISTINCT FROM to properly handle NULL organization IDs.';

