-- ============================================================
-- VERIFICATION SCRIPT: Approval Flow Fix
-- ============================================================
-- Run this script in Supabase SQL Editor to verify the fix
-- ============================================================

-- Step 1: Check if RLS policies exist and are correctly configured
-- ============================================================
SELECT 
  '✅ Step 1: Checking RLS Policies' as step,
  policyname, 
  cmd as operation,
  CASE 
    WHEN qual LIKE '%IS NOT DISTINCT FROM%' THEN '✅ Uses NULL-safe comparison'
    ELSE '❌ May have NULL handling issues'
  END as null_handling_status
FROM pg_policies
WHERE tablename = 'access_requests'
ORDER BY policyname;

-- Step 2: Check if access_requests table has correct structure
-- ============================================================
SELECT 
  '✅ Step 2: Checking Table Structure' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'access_requests'
  AND column_name IN (
    'id', 'request_number', 'status', 'organization_id',
    'approved_at', 'rejected_at', 'completed_at', 'updated_at'
  )
ORDER BY ordinal_position;

-- Step 3: Check current organization setup
-- ============================================================
SELECT 
  '✅ Step 3: Checking Organization Setup' as step,
  u.id as user_id,
  u.email,
  u.raw_app_meta_data->>'organization_id' as user_org_id,
  COUNT(ar.id) as total_requests,
  COUNT(CASE WHEN ar.status = 'PENDING' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN ar.status = 'APPROVED' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN ar.status = 'REJECTED' THEN 1 END) as rejected_requests
FROM auth.users u
LEFT JOIN access_requests ar ON ar.requester_id = u.id OR ar.created_by = u.id
GROUP BY u.id, u.email, u.raw_app_meta_data
ORDER BY u.created_at DESC
LIMIT 5;

-- Step 4: Check recent access requests and their organization IDs
-- ============================================================
SELECT 
  '✅ Step 4: Checking Recent Requests' as step,
  request_number,
  status,
  organization_id,
  CASE 
    WHEN organization_id IS NULL THEN '⚠️ NULL (should work with new RLS)'
    ELSE '✅ Has org_id'
  END as org_status,
  created_at,
  updated_at,
  approved_at,
  rejected_at
FROM access_requests
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Test RLS policy evaluation (simulated)
-- ============================================================
SELECT 
  '✅ Step 5: RLS Policy Test' as step,
  request_number,
  organization_id,
  status,
  CASE 
    -- Simulate the RLS check
    WHEN organization_id IS NULL THEN '✅ PASS (org_id IS NULL)'
    WHEN organization_id IS NOT DISTINCT FROM (
      SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    ) THEN '✅ PASS (org_id matches)'
    ELSE '⚠️ May fail RLS (org_id mismatch)'
  END as rls_check_result
FROM access_requests
ORDER BY created_at DESC
LIMIT 5;

-- Step 6: Check for any stuck/problematic requests
-- ============================================================
SELECT 
  '✅ Step 6: Checking for Stuck Requests' as step,
  request_number,
  status,
  submitted_at,
  updated_at,
  CASE 
    WHEN status = 'PENDING' AND submitted_at < NOW() - INTERVAL '7 days' 
      THEN '⚠️ Stuck (pending > 7 days)'
    WHEN status = 'PENDING' AND updated_at < submitted_at 
      THEN '⚠️ Suspicious (updated_at < submitted_at)'
    WHEN status IN ('APPROVED', 'REJECTED') AND completed_at IS NULL 
      THEN '⚠️ Missing completed_at timestamp'
    ELSE '✅ OK'
  END as health_status
FROM access_requests
ORDER BY submitted_at DESC
LIMIT 10;

-- Step 7: Summary Report
-- ============================================================
SELECT 
  '✅ Step 7: Summary Report' as step,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
  COUNT(CASE WHEN organization_id IS NULL THEN 1 END) as null_org_ids,
  COUNT(CASE WHEN organization_id IS NOT NULL THEN 1 END) as has_org_ids,
  ROUND(
    AVG(
      CASE 
        WHEN status = 'APPROVED' AND approved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (approved_at - submitted_at))/3600 
      END
    )::numeric, 
    2
  ) as avg_approval_time_hours
FROM access_requests
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================
-- EXPECTED RESULTS FOR A WORKING SYSTEM:
-- ============================================================
-- Step 1: All policies should show "Uses NULL-safe comparison"
-- Step 2: All columns should be present with correct types
-- Step 3: Users should have requests associated with them
-- Step 4: Recent requests should show proper status transitions
-- Step 5: All requests should show "PASS" for RLS check
-- Step 6: No "Stuck" or "Suspicious" requests
-- Step 7: Summary should show reasonable distribution of statuses
-- ============================================================

