-- Verification Script for Access Requests Persistence
-- Run this in Supabase SQL Editor after applying the migration

-- 1. Check if table exists
SELECT 
  'Table exists: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'access_requests'
  ) THEN '✅ YES' ELSE '❌ NO' END as table_check;

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'access_requests'
ORDER BY ordinal_position;

-- 3. Check RLS is enabled
SELECT 
  tablename, 
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename = 'access_requests';

-- 4. List all RLS policies
SELECT 
  policyname,
  permissive as permissive_restrictive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'access_requests'
ORDER BY policyname;

-- 5. Test current_org_id function
SELECT 
  current_setting('request.jwt.claims', true) as jwt_claims,
  public.current_org_id() as org_id_from_function;

-- 6. Count existing requests
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_count
FROM access_requests;

-- 7. Sample recent requests (limit 5)
SELECT 
  id,
  request_number,
  status,
  resource_name,
  resource_type,
  submitted_at,
  organization_id,
  requester_id
FROM access_requests
ORDER BY submitted_at DESC
LIMIT 5;

-- 8. Check for orphaned requests (no org or requester)
SELECT 
  COUNT(*) as orphaned_requests,
  COUNT(CASE WHEN organization_id IS NULL THEN 1 END) as missing_org,
  COUNT(CASE WHEN requester_id IS NULL THEN 1 END) as missing_requester
FROM access_requests;
