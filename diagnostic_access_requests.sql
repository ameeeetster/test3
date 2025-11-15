-- ================================================
-- DIAGNOSTIC: Check Access Requests Table Status
-- ================================================
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check if access_requests table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'access_requests';

-- 2. If table exists, check its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'access_requests'
ORDER BY ordinal_position;

-- 3. Check RLS policies on access_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'access_requests';

-- 4. Check if there are any existing records
SELECT COUNT(*) as total_requests,
       COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_requests,
       COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_requests,
       COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_requests
FROM public.access_requests;

-- 5. Check latest 5 requests (if any)
SELECT 
    id,
    request_number,
    status,
    resource_name,
    resource_type,
    submitted_at,
    created_at
FROM public.access_requests
ORDER BY submitted_at DESC
LIMIT 5;

-- 6. Check migration history
SELECT 
    version,
    name,
    executed_at
FROM supabase_migrations.schema_migrations
WHERE name LIKE '%access_request%'
ORDER BY version DESC;
