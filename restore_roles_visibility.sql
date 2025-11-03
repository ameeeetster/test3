-- Restore roles visibility by fixing RLS policies
-- Run this in Supabase SQL Editor

-- 1. First, check if roles exist
SELECT 'Roles Check' as check_type, count(*) as count FROM public.roles;

-- 2. Show all roles with their org_id
SELECT 
  id, 
  name, 
  org_id, 
  created_by,
  created_at
FROM public.roles
ORDER BY created_at DESC;

-- 3. Drop ALL existing policies on roles table to start fresh
DROP POLICY IF EXISTS "roles_select_org" ON public.roles;
DROP POLICY IF EXISTS "roles_authenticated_select" ON public.roles;
DROP POLICY IF EXISTS "roles_select_all_auth" ON public.roles;
DROP POLICY IF EXISTS "roles_modify_admin" ON public.roles;
DROP POLICY IF EXISTS "roles_insert_auth" ON public.roles;
DROP POLICY IF EXISTS "roles_update_auth" ON public.roles;

-- 4. Create a simple policy that allows all authenticated users to see all roles
CREATE POLICY "roles_select_authenticated" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Allow authenticated users to insert roles (for creation)
CREATE POLICY "roles_insert_authenticated" ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Allow authenticated users to update roles
CREATE POLICY "roles_update_authenticated" ON public.roles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;

-- 8. Test query
SELECT 'Test Query Result' as status, * FROM public.roles ORDER BY created_at DESC LIMIT 5;

