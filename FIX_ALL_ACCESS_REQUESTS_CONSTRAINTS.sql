-- ========================================
-- COMPREHENSIVE FIX: Remove ALL NOT NULL constraints from optional columns
-- Run this ONCE in Supabase SQL Editor to fix forever
-- ========================================

-- Remove NOT NULL constraints from ALL optional columns
ALTER TABLE public.access_requests 
  ALTER COLUMN organization_id DROP NOT NULL,
  ALTER COLUMN requester_id DROP NOT NULL,
  ALTER COLUMN for_user_id DROP NOT NULL,
  ALTER COLUMN resource_id DROP NOT NULL,
  ALTER COLUMN priority DROP NOT NULL,
  ALTER COLUMN business_justification DROP NOT NULL,
  ALTER COLUMN duration_type DROP NOT NULL,
  ALTER COLUMN duration_days DROP NOT NULL,
  ALTER COLUMN risk_level DROP NOT NULL,
  ALTER COLUMN risk_score DROP NOT NULL,
  ALTER COLUMN sla_due_date DROP NOT NULL,
  ALTER COLUMN approved_at DROP NOT NULL,
  ALTER COLUMN rejected_at DROP NOT NULL,
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN cancelled_at DROP NOT NULL,
  ALTER COLUMN correlation_id DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN updated_by DROP NOT NULL;

-- Verify all columns are now nullable (except the required ones)
SELECT 
  column_name, 
  is_nullable, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'access_requests'
ORDER BY ordinal_position;

-- Expected: Only these should be NOT NULL:
-- - id (primary key)
-- - request_number
-- - resource_type
-- - resource_name
-- - status
-- - sod_conflicts_count (has default)
-- - sla_breached (has default)
-- - submitted_at (has default)
-- - created_at (has default)
-- - updated_at (has default)

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All optional columns in access_requests are now nullable!';
  RAISE NOTICE '✅ You can now create requests without providing all fields.';
END $$;

