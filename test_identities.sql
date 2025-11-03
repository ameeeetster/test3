-- Test script to verify identities views and Edge Function
-- Run this in Supabase Studio SQL Editor or psql

-- 1. Create a test organization
INSERT INTO public.orgs (name, slug) 
VALUES ('Test Corporation', 'test-corp') 
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Get the org ID
DO $$
DECLARE
    test_org_id uuid;
BEGIN
    SELECT id INTO test_org_id FROM public.orgs WHERE slug = 'test-corp';
    
    -- 3. Create test auth users (simulate what would happen with real auth)
    -- Note: In real scenario, these would be created through Supabase Auth
    
    -- 4. Create test profiles
    INSERT INTO public.profiles (id, email, full_name, mfa_enabled)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', 'john.doe@test.com', 'John Doe', false),
        ('22222222-2222-2222-2222-222222222222', 'jane.smith@test.com', 'Jane Smith', false),
        ('33333333-3333-3333-3333-333333333333', 'bob.wilson@test.com', 'Bob Wilson', false)
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- 5. Create user-org memberships
    INSERT INTO public.user_orgs (user_id, org_id, role)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', test_org_id, 'member'),
        ('22222222-2222-2222-2222-222222222222', test_org_id, 'org_admin'),
        ('33333333-3333-3333-3333-333333333333', test_org_id, 'member')
    ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role;

    -- 6. Create some test roles
    INSERT INTO public.roles (org_id, name, slug, description)
    VALUES 
        (test_org_id, 'Developer', 'developer', 'Software development role'),
        (test_org_id, 'Manager', 'manager', 'Management role')
    ON CONFLICT (org_id, slug) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description;

    -- 7. Assign roles to users
    INSERT INTO public.role_assignments (role_id, permission_id)
    SELECT r.id, p.id
    FROM public.roles r
    CROSS JOIN public.permissions p
    WHERE r.org_id = test_org_id
    ON CONFLICT (role_id, permission_id) DO NOTHING;

END $$;

-- 8. Test the views
SELECT 'Testing v_user_role_counts:' as test_name;
SELECT * FROM public.v_user_role_counts;

SELECT 'Testing v_user_last_login:' as test_name;
SELECT * FROM public.v_user_last_login;

SELECT 'Testing v_user_flags:' as test_name;
SELECT * FROM public.v_user_flags;

SELECT 'Testing v_user_risk:' as test_name;
SELECT * FROM public.v_user_risk;

SELECT 'Testing v_identities:' as test_name;
SELECT * FROM public.v_identities;

-- 9. Test audit logs
SELECT 'Testing audit logs:' as test_name;
SELECT * FROM public.audit_logs ORDER BY occurred_at DESC LIMIT 5;
