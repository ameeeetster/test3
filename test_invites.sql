-- Test script for invite-based onboarding flow
-- Run this in Supabase Studio SQL Editor or psql

-- 1. Create a test organization
INSERT INTO public.orgs (name, slug) 
VALUES ('Test Corporation', 'test-corp') 
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Create a test admin user (simulate auth user)
DO $$
DECLARE
    test_org_id uuid;
    admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get the org ID
    SELECT id INTO test_org_id FROM public.orgs WHERE slug = 'test-corp';
    
    -- Create admin profile
    INSERT INTO public.profiles (id, email, full_name, mfa_enabled)
    VALUES (admin_user_id, 'admin@test.com', 'Admin User', false)
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- Create admin org membership
    INSERT INTO public.user_orgs (user_id, org_id, role)
    VALUES (admin_user_id, test_org_id, 'org_admin')
    ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role;

    -- Create some test roles
    INSERT INTO public.roles (org_id, name, slug, description)
    VALUES 
        (test_org_id, 'Developer', 'developer', 'Software development role'),
        (test_org_id, 'Manager', 'manager', 'Management role')
    ON CONFLICT (org_id, slug) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description;

END $$;

-- 3. Test the invitations table structure
SELECT 'Testing invitations table:' as test_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'invitations' 
ORDER BY ordinal_position;

-- 4. Test RLS policies
SELECT 'Testing RLS policies:' as test_name;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invitations';

-- 5. Test helper functions
SELECT 'Testing helper functions:' as test_name;
SELECT 'current_org_id function exists:' as test, 
       EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'current_org_id') as exists;

SELECT 'is_org_admin function exists:' as test, 
       EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_org_admin') as exists;

-- 6. Test cleanup function
SELECT 'Testing cleanup function:' as test_name;
SELECT 'cleanup_expired_invitations function exists:' as test, 
       EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_invitations') as exists;

-- 7. Show current data
SELECT 'Current organizations:' as test_name;
SELECT * FROM public.orgs;

SELECT 'Current profiles:' as test_name;
SELECT * FROM public.profiles;

SELECT 'Current user_orgs:' as test_name;
SELECT * FROM public.user_orgs;

SELECT 'Current roles:' as test_name;
SELECT * FROM public.roles;

-- 8. Test audit logs
SELECT 'Current audit logs:' as test_name;
SELECT * FROM public.audit_logs ORDER BY occurred_at DESC LIMIT 5;
