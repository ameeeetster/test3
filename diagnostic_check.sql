-- Diagnostic Query - Run this in Supabase SQL Editor
-- This will help us understand the issue

-- 1. Check if current user exists
SELECT 
  'Current User Check' as check_type,
  auth.uid() as user_id,
  exists(SELECT 1 FROM auth.users WHERE id = auth.uid()) as user_exists_in_auth;

-- 2. Check roles table schema
SELECT 
  'Roles Table Schema' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'roles' 
ORDER BY ordinal_position;

-- 3. Check if function exists
SELECT 
  'Function Check' as check_type,
  proname as function_name,
  proargnames as arg_names,
  pronargs as arg_count
FROM pg_proc 
WHERE proname = 'handle_create_role';

-- 4. Check permissions count
SELECT 
  'Permissions Check' as check_type,
  count(*) as permission_count
FROM public.permissions;

-- 5. Check orgs count
SELECT 
  'Orgs Check' as check_type,
  count(*) as org_count,
  array_agg(id) as org_ids
FROM public.orgs;

-- 6. Check user_orgs for current user
SELECT 
  'User Orgs Check' as check_type,
  count(*) as membership_count,
  array_agg(org_id) as org_ids,
  array_agg(role) as roles
FROM public.user_orgs
WHERE user_id = auth.uid();

