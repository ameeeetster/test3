-- IMMEDIATE FIX: Run this in Supabase SQL Editor
-- This removes the NOT NULL constraints on organization_id and for_user_id

-- Remove NOT NULL constraint from organization_id
ALTER TABLE public.access_requests 
  ALTER COLUMN organization_id DROP NOT NULL;

-- Remove NOT NULL constraint from for_user_id
ALTER TABLE public.access_requests 
  ALTER COLUMN for_user_id DROP NOT NULL;

-- Verify the changes
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'access_requests' 
  AND column_name IN ('organization_id', 'for_user_id')
ORDER BY column_name;

-- Both should show: is_nullable = 'YES'

