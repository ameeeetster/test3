-- Update the role to have a proper owner
-- Run this in Supabase SQL Editor

-- 1. Check current user
SELECT 
  'Current User' as check,
  auth.uid() as user_id,
  auth.email() as email;

-- 2. Update the role to have the current user as creator
UPDATE public.roles
SET created_by = auth.uid()
WHERE id = (
  SELECT id FROM public.roles ORDER BY created_at DESC LIMIT 1
);

-- 3. Verify the update
SELECT 
  id,
  name,
  created_by,
  auth.uid() as current_user_id
FROM public.roles
ORDER BY created_at DESC
LIMIT 1;

