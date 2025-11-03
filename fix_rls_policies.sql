-- Fix RLS policies to allow authenticated users to see roles
-- Run this in Supabase SQL Editor

-- First, check which org_id the role belongs to
SELECT id, name, org_id FROM public.roles;

-- Check if user has access to that org
SELECT 
  uo.user_id,
  uo.org_id,
  uo.role,
  uo.is_active
FROM public.user_orgs uo
WHERE uo.user_id = auth.uid();

-- Now fix the RLS policies to allow broader access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "roles_select_org" ON public.roles;
DROP POLICY IF EXISTS "roles_authenticated_select" ON public.roles;
DROP POLICY IF EXISTS "roles_select_org" ON public.roles;

-- Create a more permissive policy that allows all authenticated users to see roles
CREATE POLICY "roles_select_all_auth" ON public.roles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Also allow inserts for authenticated users (within their org)
CREATE POLICY "roles_insert_auth" ON public.roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow updates for authenticated users
CREATE POLICY "roles_update_auth" ON public.roles
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.roles TO authenticated;

-- Test query to verify it works
SELECT 
  'Test Query' as check_type,
  count(*) as role_count
FROM public.roles;

