-- Check if roles exist in the database
-- Run this in Supabase SQL Editor to diagnose

-- 1. Check if any roles exist
SELECT 
  'Roles in database' as check_type,
  count(*) as role_count,
  array_agg(name) as role_names
FROM public.roles;

-- 2. Show details of all roles
SELECT 
  id,
  name,
  description,
  org_id,
  created_by,
  created_at
FROM public.roles
ORDER BY created_at DESC;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'roles';

-- 4. Check current user
SELECT 
  'Current User' as check_type,
  auth.uid() as user_id,
  auth.email() as user_email;

