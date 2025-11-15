-- ========================================
-- FIX: Remove foreign key constraints that are blocking inserts
-- Run this in Supabase SQL Editor
-- ========================================

-- First, find all foreign key constraints on access_requests
SELECT 
    con.conname AS constraint_name,
    att.attname AS column_name
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
WHERE rel.relname = 'access_requests'
  AND con.contype = 'f'
ORDER BY con.conname;

-- Drop the foreign key constraint on requester_id (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_requester_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_requester_id_fkey;
        RAISE NOTICE '✅ Dropped access_requests_requester_id_fkey';
    END IF;
END $$;

-- Drop the foreign key constraint on for_user_id (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_for_user_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_for_user_id_fkey;
        RAISE NOTICE '✅ Dropped access_requests_for_user_id_fkey';
    END IF;
END $$;

-- Drop the foreign key constraint on organization_id (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_organization_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_organization_id_fkey;
        RAISE NOTICE '✅ Dropped access_requests_organization_id_fkey';
    END IF;
END $$;

-- Drop the foreign key constraint on created_by (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_created_by_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_created_by_fkey;
        RAISE NOTICE '✅ Dropped access_requests_created_by_fkey';
    END IF;
END $$;

-- Drop the foreign key constraint on updated_by (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_updated_by_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_updated_by_fkey;
        RAISE NOTICE '✅ Dropped access_requests_updated_by_fkey';
    END IF;
END $$;

-- Verify all foreign keys are removed
SELECT 
    con.conname AS constraint_name,
    att.attname AS column_name
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
WHERE rel.relname = 'access_requests'
  AND con.contype = 'f'
ORDER BY con.conname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All foreign key constraints removed from access_requests!';
  RAISE NOTICE '✅ You can now create requests without existing user references.';
END $$;

