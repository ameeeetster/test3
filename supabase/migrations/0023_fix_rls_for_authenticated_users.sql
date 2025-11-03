-- Fix RLS policies to allow authenticated users to insert/update data
-- This migration ensures authenticated users can perform CRUD operations within their organization

-- ===== ORGS TABLE RLS =====
-- Allow authenticated users to see orgs they belong to
DROP POLICY IF EXISTS "orgs_authenticated_select" ON public.orgs;
CREATE POLICY "orgs_authenticated_select" ON public.orgs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_orgs 
      WHERE org_id = orgs.id AND is_active = true
    )
  );

-- Allow authenticated users to create orgs (for development/bootstrap)
DROP POLICY IF EXISTS "orgs_authenticated_insert" ON public.orgs;
CREATE POLICY "orgs_authenticated_insert" ON public.orgs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===== USER_ORGS TABLE RLS =====
-- Allow authenticated users to see their own org memberships
DROP POLICY IF EXISTS "user_orgs_authenticated_select" ON public.user_orgs;
CREATE POLICY "user_orgs_authenticated_select" ON public.user_orgs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow authenticated users to insert their own membership (bootstrap) or admin actions within their org
DROP POLICY IF EXISTS "user_orgs_authenticated_insert" ON public.user_orgs;
CREATE POLICY "user_orgs_authenticated_insert" ON public.user_orgs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Bootstrap: user can add themself to an org
      user_id = auth.uid()
      OR
      -- Admins can add memberships in their org
      org_id IN (
        SELECT org_id FROM public.user_orgs 
        WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
      )
    )
  );

-- ===== ROLES TABLE RLS =====
-- Allow authenticated users to see roles in their org
DROP POLICY IF EXISTS "roles_authenticated_select" ON public.roles;
CREATE POLICY "roles_authenticated_select" ON public.roles
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow authenticated users to create roles in their org (org_admin/admin/owner)
DROP POLICY IF EXISTS "roles_authenticated_insert" ON public.roles;
CREATE POLICY "roles_authenticated_insert" ON public.roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
    )
  );

-- Allow authenticated users to update roles they own
DROP POLICY IF EXISTS "roles_authenticated_update" ON public.roles;
CREATE POLICY "roles_authenticated_update" ON public.roles
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
    )
  );

-- ===== ROLE_PERMISSIONS TABLE RLS =====
-- Allow authenticated users to see role permissions in their org
DROP POLICY IF EXISTS "role_permissions_authenticated_select" ON public.role_permissions;
CREATE POLICY "role_permissions_authenticated_select" ON public.role_permissions
  FOR SELECT
  USING (
    role_id IN (
      SELECT id FROM public.roles 
      WHERE org_id IN (
        SELECT org_id FROM public.user_orgs 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Allow authenticated users to manage role permissions in their org
DROP POLICY IF EXISTS "role_permissions_authenticated_insert" ON public.role_permissions;
CREATE POLICY "role_permissions_authenticated_insert" ON public.role_permissions
  FOR INSERT
  WITH CHECK (
    role_id IN (
      SELECT id FROM public.roles r
      WHERE r.org_id IN (
        SELECT org_id FROM public.user_orgs 
        WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
      )
    )
  );

-- ===== PERMISSIONS TABLE RLS =====
-- Allow all authenticated users to see permissions (these are system-wide)
DROP POLICY IF EXISTS "permissions_authenticated_select" ON public.permissions;
CREATE POLICY "permissions_authenticated_select" ON public.permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ===== ROLE_ASSIGNMENTS TABLE RLS =====
-- Allow authenticated users to see role assignments in their org
DROP POLICY IF EXISTS "role_assignments_authenticated_select" ON public.role_assignments;
CREATE POLICY "role_assignments_authenticated_select" ON public.role_assignments
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow authenticated users to assign roles in their org
DROP POLICY IF EXISTS "role_assignments_authenticated_insert" ON public.role_assignments;
CREATE POLICY "role_assignments_authenticated_insert" ON public.role_assignments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin','admin','owner')
    )
  );

-- ===== AUDIT_LOGS TABLE RLS =====
-- Allow authenticated users to see audit logs for their org
DROP POLICY IF EXISTS "audit_logs_authenticated_select" ON public.audit_logs;
CREATE POLICY "audit_logs_authenticated_select" ON public.audit_logs
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow authenticated users to insert audit logs
DROP POLICY IF EXISTS "audit_logs_authenticated_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_authenticated_insert" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    actor_id = auth.uid() AND
    org_id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
