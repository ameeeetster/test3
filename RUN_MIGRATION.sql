-- Add extended identity attributes for comprehensive identity management
-- Migration: 0037_add_extended_identity_attributes.sql

-- Add Phase 3 fields: Employee ID, Location, Cost Center, Employment Type, Division
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employee_id text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS office_address text,
  ADD COLUMN IF NOT EXISTS cost_center text,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS business_unit text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS mobile_phone text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS password_last_changed timestamptz,
  ADD COLUMN IF NOT EXISTS failed_login_attempts int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_locked_until timestamptz,
  ADD COLUMN IF NOT EXISTS data_classification text,
  ADD COLUMN IF NOT EXISTS compliance_certifications text[],
  ADD COLUMN IF NOT EXISTS privacy_consent_status text,
  ADD COLUMN IF NOT EXISTS audit_trail_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarding_status text,
  ADD COLUMN IF NOT EXISTS offboarding_status text,
  ADD COLUMN IF NOT EXISTS risk_score numeric(5,2) DEFAULT 0.0;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_employment_type ON public.profiles(employment_type) WHERE employment_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_division ON public.profiles(division) WHERE division IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_start_date ON public.profiles(start_date) WHERE start_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_risk_score ON public.profiles(risk_score);

-- Add helpful comments
COMMENT ON COLUMN public.profiles.employee_id IS 'Unique employee identifier/badge number';
COMMENT ON COLUMN public.profiles.location IS 'Physical office location';
COMMENT ON COLUMN public.profiles.office_address IS 'Full office address';
COMMENT ON COLUMN public.profiles.cost_center IS 'Financial cost center code';
COMMENT ON COLUMN public.profiles.employment_type IS 'Employment type: Full-time, Part-time, Contractor, Intern';
COMMENT ON COLUMN public.profiles.division IS 'Business division';
COMMENT ON COLUMN public.profiles.business_unit IS 'Business unit within division';
COMMENT ON COLUMN public.profiles.start_date IS 'Employment start date';
COMMENT ON COLUMN public.profiles.end_date IS 'Employment end date (for terminated users)';
COMMENT ON COLUMN public.profiles.mobile_phone IS 'Mobile phone number';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone';
COMMENT ON COLUMN public.profiles.preferred_language IS 'Preferred language code';
COMMENT ON COLUMN public.profiles.password_last_changed IS 'Timestamp of last password change';
COMMENT ON COLUMN public.profiles.failed_login_attempts IS 'Count of failed login attempts';
COMMENT ON COLUMN public.profiles.account_locked IS 'Whether account is currently locked';
COMMENT ON COLUMN public.profiles.account_locked_until IS 'Timestamp until which account is locked';
COMMENT ON COLUMN public.profiles.data_classification IS 'Data classification access level';
COMMENT ON COLUMN public.profiles.compliance_certifications IS 'Array of required compliance certifications';
COMMENT ON COLUMN public.profiles.privacy_consent_status IS 'Privacy consent status';
COMMENT ON COLUMN public.profiles.audit_trail_enabled IS 'Whether audit trail is enabled for this user';
COMMENT ON COLUMN public.profiles.onboarding_status IS 'Onboarding status: Pending, In Progress, Complete';
COMMENT ON COLUMN public.profiles.offboarding_status IS 'Offboarding status: Pending, In Progress, Complete';
COMMENT ON COLUMN public.profiles.risk_score IS 'Calculated risk score (0-100)';

