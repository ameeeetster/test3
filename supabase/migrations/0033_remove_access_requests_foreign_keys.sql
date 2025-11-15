-- Remove foreign key constraints from access_requests to allow flexible inserts
-- Migration: 0033_remove_access_requests_foreign_keys.sql

-- Drop foreign key constraints (if they exist)
-- These constraints were blocking inserts when user IDs don't exist in auth.users

DO $$ 
BEGIN
    -- Drop requester_id foreign key
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_requester_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_requester_id_fkey;
    END IF;

    -- Drop for_user_id foreign key
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_for_user_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_for_user_id_fkey;
    END IF;

    -- Drop organization_id foreign key
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_organization_id_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_organization_id_fkey;
    END IF;

    -- Drop created_by foreign key
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_created_by_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_created_by_fkey;
    END IF;

    -- Drop updated_by foreign key
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'access_requests_updated_by_fkey'
    ) THEN
        ALTER TABLE public.access_requests 
        DROP CONSTRAINT access_requests_updated_by_fkey;
    END IF;
END $$;

-- Add comment explaining why foreign keys were removed
comment on table public.access_requests is 'Access requests table - foreign key constraints removed to allow flexible user references during development';

