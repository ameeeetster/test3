-- Enable RLS on orgs table and ensure policies allow authenticated users to create orgs
-- This is needed for auto-organization creation when users don't have an org

-- Enable RLS on orgs table
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "orgs_authenticated_select" ON public.orgs;
DROP POLICY IF EXISTS "orgs_authenticated_insert" ON public.orgs;
DROP POLICY IF EXISTS "orgs_select_org" ON public.orgs;
DROP POLICY IF EXISTS "orgs_modify_admin" ON public.orgs;

-- Allow authenticated users to see orgs they belong to
CREATE POLICY "orgs_authenticated_select" ON public.orgs
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- User belongs to this org
      id IN (
        SELECT org_id FROM public.user_orgs 
        WHERE user_id = auth.uid() AND is_active = true
      )
      OR
      -- Allow seeing all orgs for bootstrap (temporary, can be restricted later)
      true
    )
  );

-- Allow authenticated users to create orgs (for bootstrap/auto-creation)
CREATE POLICY "orgs_authenticated_insert" ON public.orgs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update orgs they admin
CREATE POLICY "orgs_authenticated_update" ON public.orgs
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin', 'admin', 'owner')
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT org_id FROM public.user_orgs 
      WHERE user_id = auth.uid() AND is_active = true AND role IN ('org_admin', 'admin', 'owner')
    )
  );

