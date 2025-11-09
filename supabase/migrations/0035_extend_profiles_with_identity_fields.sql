-- Extend profiles table with all identity form fields
-- Migration: 0035_extend_profiles_with_identity_fields.sql

-- Add columns for personal information
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text;

-- Add columns for organizational information
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_title text;

-- Add columns for access control
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'low';

-- Add columns for account settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS account_expiration timestamptz,
  ADD COLUMN IF NOT EXISTS require_password_change boolean DEFAULT false;

-- Add column for additional notes
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notes text;

-- Create index on username for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Add helpful comments
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.department IS 'User department';
COMMENT ON COLUMN public.profiles.manager_id IS 'Reference to manager user';
COMMENT ON COLUMN public.profiles.job_title IS 'User job title';
COMMENT ON COLUMN public.profiles.status IS 'User status: active, inactive, pending';
COMMENT ON COLUMN public.profiles.risk_level IS 'User risk level: low, medium, high, critical';
COMMENT ON COLUMN public.profiles.username IS 'User username for login';
COMMENT ON COLUMN public.profiles.account_expiration IS 'Account expiration date';
COMMENT ON COLUMN public.profiles.require_password_change IS 'Require password change on first login';
COMMENT ON COLUMN public.profiles.notes IS 'Additional notes about the user';

