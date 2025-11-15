-- Create SSO Providers table for storing SSO configuration
-- Migration: 0038_create_sso_providers_table.sql

CREATE TABLE IF NOT EXISTS public.sso_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('saml', 'oidc', 'oauth')),
  enabled boolean DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_tested_at timestamptz,
  test_status text CHECK (test_status IN ('success', 'failed', 'pending')),
  sign_in_count int DEFAULT 0,
  last_sign_in_at timestamptz
);

-- Enable RLS
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all SSO providers
CREATE POLICY sso_providers_select ON public.sso_providers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can modify (admins should be checked in application layer)
CREATE POLICY sso_providers_modify ON public.sso_providers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sso_providers_type ON public.sso_providers(type);
CREATE INDEX IF NOT EXISTS idx_sso_providers_enabled ON public.sso_providers(enabled);
CREATE INDEX IF NOT EXISTS idx_sso_providers_created_at ON public.sso_providers(created_at DESC);

-- Add helpful comments
COMMENT ON TABLE public.sso_providers IS 'Stores SSO provider configurations (SAML, OIDC, OAuth)';
COMMENT ON COLUMN public.sso_providers.name IS 'Display name for the SSO provider';
COMMENT ON COLUMN public.sso_providers.type IS 'Provider type: saml, oidc, or oauth';
COMMENT ON COLUMN public.sso_providers.enabled IS 'Whether this provider is currently enabled';
COMMENT ON COLUMN public.sso_providers.config IS 'JSON configuration containing provider-specific settings';
COMMENT ON COLUMN public.sso_providers.last_tested_at IS 'Timestamp of last connection test';
COMMENT ON COLUMN public.sso_providers.test_status IS 'Status of last test: success, failed, or pending';
COMMENT ON COLUMN public.sso_providers.sign_in_count IS 'Total number of sign-ins using this provider';
COMMENT ON COLUMN public.sso_providers.last_sign_in_at IS 'Timestamp of most recent sign-in using this provider';

