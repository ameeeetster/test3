-- Fix profiles RLS to allow viewing identities in same organization
-- Migration: 0036_fix_profiles_rls_for_identities.sql

-- Drop the restrictive self-only policy
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;

-- Create a new policy that allows users to see profiles in their organization
-- Users can see:
-- 1. Their own profile
-- 2. Profiles of users in the same organization (via user_orgs)
CREATE POLICY profiles_select_org
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    -- User can see their own profile
    auth.uid() = id
    OR
    -- User can see profiles of users in the same organization
    id IN (
      SELECT uo2.user_id
      FROM public.user_orgs uo1
      JOIN public.user_orgs uo2 ON uo1.org_id = uo2.org_id
      WHERE uo1.user_id = auth.uid()
        AND uo1.is_active = true
        AND uo2.is_active = true
    )
    OR
    -- Temporary: Allow all authenticated users to see all profiles during development
    -- TODO: Remove this in production and rely on organization scoping above
    auth.uid() IS NOT NULL
  );

-- Keep the update policy for self-updates
-- (The existing profiles_update_self policy should remain)

-- Add helpful comment
COMMENT ON POLICY profiles_select_org ON public.profiles IS 
  'Allow users to see profiles in their organization, plus all profiles during development';

