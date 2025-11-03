# Status and Dormancy Tracking System

This document describes the automatic status and dormancy tracking system for the IAM platform. The system automatically manages user statuses based on login activity and allows manual overrides for administrative control.

## Overview

The status tracking system provides:
- **Automatic dormancy detection** based on configurable thresholds
- **Manual status overrides** for administrative control
- **Comprehensive audit logging** of all status changes
- **Organization-scoped settings** for different dormancy policies
- **Real-time status updates** in the identities view

## Architecture

### Database Schema

#### `org_settings` Table
Stores organization-level settings for dormancy detection:
```sql
org_settings (
  org_id uuid PRIMARY KEY,
  dormant_days int DEFAULT 45,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
)
```

#### `user_status_overrides` Table
Stores manual status overrides set by administrators:
```sql
user_status_overrides (
  user_id uuid,
  org_id uuid,
  status text CHECK (status IN ('disabled', 'active_override')),
  reason text NOT NULL,
  set_by uuid REFERENCES auth.users(id),
  set_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
)
```

#### `profiles` Table Updates
Added status column to track current user status:
```sql
ALTER TABLE profiles ADD COLUMN status text DEFAULT 'inactive' 
CHECK (status IN ('active', 'inactive', 'disabled', 'dormant'));
```

### Status Types

- **`active`**: User has recent login activity within the dormancy threshold
- **`inactive`**: User has no login history or account not yet activated
- **`disabled`**: User manually disabled by administrator
- **`dormant`**: User has not logged in within the dormancy threshold

## Automatic Dormancy Detection

### Nightly Scan Process

The system runs a nightly dormancy scan via the `dormancy-scan` Edge Function:

1. **Fetches organization settings** to get dormancy thresholds
2. **Scans all users** in each organization
3. **Calculates login activity** using the `v_user_last_login` view
4. **Updates user statuses** based on dormancy rules
5. **Logs all changes** to the audit system

### Dormancy Rules

For each user, the system determines status based on:

1. **Manual Overrides**: If a user has a status override, that takes precedence
2. **Login Activity**: 
   - No login history → `inactive`
   - Login within threshold → `active`
   - Login beyond threshold → `dormant`

### Setting Up Nightly Scans

Configure Supabase cron to run the dormancy scan nightly:

```sql
-- Create cron job for nightly dormancy scan
SELECT cron.schedule(
  'dormancy-scan',
  '0 2 * * *', -- Run at 2 AM daily
  'SELECT net.http_post(
    url := ''https://your-project.supabase.co/functions/v1/dormancy-scan'',
    headers := ''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'',
    body := ''{}''
  );'
);
```

## Manual Status Management

### Status Override API

Administrators can manually override user statuses using the `/status-override` endpoint:

#### Create Status Override

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/status-override" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid-here",
    "status": "disabled",
    "reason": "Security incident - temporary disable"
  }'
```

#### Override Status Types

- **`disabled`**: Permanently disable user regardless of login activity
- **`active_override`**: Force user to active status regardless of login activity

### SQL Functions for Status Management

#### Create Status Override
```sql
SELECT public.create_status_override(
  'user-uuid',           -- Target user ID
  'org-uuid',            -- Organization ID
  'disabled',            -- Override status
  'Security incident'    -- Reason
);
```

#### Remove Status Override
```sql
SELECT public.remove_status_override(
  'user-uuid',           -- Target user ID
  'org-uuid'            -- Organization ID
);
```

#### Recalculate User Status
```sql
SELECT public.recalculate_user_status(
  'user-uuid',           -- Target user ID
  'org-uuid'            -- Organization ID
);
```

## Organization Settings Management

### Configuring Dormancy Thresholds

Each organization can set its own dormancy threshold:

```sql
-- Set dormancy threshold to 30 days
INSERT INTO public.org_settings (org_id, dormant_days, updated_by)
VALUES ('org-uuid', 30, auth.uid())
ON CONFLICT (org_id) 
DO UPDATE SET 
  dormant_days = EXCLUDED.dormant_days,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;
```

### Query Organization Settings

```sql
-- Get current org settings
SELECT * FROM public.v_org_settings;

-- Get settings for specific org (admin only)
SELECT * FROM public.org_settings WHERE org_id = 'org-uuid';
```

## Status Views and Queries

### Enhanced Identities View

The `v_identities` view now includes status information:

```sql
SELECT 
  id,
  name,
  email,
  status,                    -- Current status (active/inactive/disabled/dormant)
  status_display,           -- Human-readable status
  effective_status,         -- Status considering overrides
  has_dormant,             -- Boolean flag for dormant users
  flags_count,             -- Number of flags (includes dormant)
  has_status_override,     -- Has manual override
  override_status          -- Override type if present
FROM public.v_identities
WHERE status = 'dormant';  -- Find all dormant users
```

### Status Override View

Query current status overrides:

```sql
SELECT 
  user_name,
  user_email,
  override_status,
  reason,
  set_by_name,
  set_at
FROM public.v_status_overrides
ORDER BY set_at DESC;
```

## Audit and Compliance

### Audit Logging

All status changes are automatically logged to `audit_logs`:

```sql
-- Query status change audit trail
SELECT 
  user_id,
  org_id,
  action,
  details->>'old_status' as old_status,
  details->>'new_status' as new_status,
  details->>'reason' as reason,
  created_at
FROM public.audit_logs
WHERE action = 'STATUS_CHANGE'
ORDER BY created_at DESC;
```

### Compliance Reporting

Generate compliance reports for dormant users:

```sql
-- Dormant users report
SELECT 
  p.full_name,
  p.email,
  p.department,
  vul.last_login_at,
  EXTRACT(DAYS FROM (now() - vul.last_login_at)) as days_since_login,
  os.dormant_days as threshold
FROM public.profiles p
JOIN public.user_orgs uo ON uo.user_id = p.id
JOIN public.org_settings os ON os.org_id = uo.org_id
LEFT JOIN public.v_user_last_login vul ON vul.user_id = p.id
WHERE p.status = 'dormant'
  AND uo.org_id = public.current_org_id()
ORDER BY vul.last_login_at ASC;
```

## Security and Access Control

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **`org_settings`**: Only org admins can read/write their org's settings
- **`user_status_overrides`**: Only org admins can manage overrides for their org
- **Status views**: Filtered by `current_org_id()` for tenant isolation

### Admin Verification

All status override operations verify:
1. User is authenticated
2. User belongs to an organization
3. User has admin privileges (`is_org_admin()`)
4. Target user belongs to the same organization

## Integration with Risk Scoring

The status system feeds into risk scoring:

- **Dormant users** increase risk scores
- **Disabled users** may have different risk calculations
- **Override statuses** can affect risk assessments

Example risk scoring integration:
```sql
-- Update risk scores based on status
UPDATE public.user_risk_scores 
SET risk_score = CASE 
  WHEN p.status = 'dormant' THEN risk_score + 20
  WHEN p.status = 'disabled' THEN risk_score + 50
  ELSE risk_score
END
FROM public.profiles p
WHERE user_risk_scores.user_id = p.id;
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Dormancy Scan Success**: Monitor Edge Function execution
2. **Status Change Volume**: Track status change frequency
3. **Override Usage**: Monitor manual override patterns
4. **Audit Log Completeness**: Ensure all changes are logged

### Example Monitoring Queries

```sql
-- Daily status change summary
SELECT 
  DATE(created_at) as date,
  details->>'new_status' as status,
  COUNT(*) as count
FROM public.audit_logs
WHERE action = 'STATUS_CHANGE'
  AND created_at >= now() - interval '30 days'
GROUP BY DATE(created_at), details->>'new_status'
ORDER BY date DESC;

-- Users with recent overrides
SELECT 
  p.full_name,
  p.email,
  uso.status as override_status,
  uso.reason,
  uso.set_at
FROM public.user_status_overrides uso
JOIN public.profiles p ON p.id = uso.user_id
WHERE uso.set_at >= now() - interval '7 days'
ORDER BY uso.set_at DESC;
```

## Troubleshooting

### Common Issues

1. **Dormancy scan not running**: Check cron job configuration
2. **Status not updating**: Verify RLS policies and permissions
3. **Override not working**: Confirm admin privileges
4. **Missing audit logs**: Check audit function permissions

### Debug Queries

```sql
-- Check user's current status calculation
SELECT 
  p.id,
  p.full_name,
  p.status,
  vul.last_login_at,
  os.dormant_days,
  uso.status as override_status
FROM public.profiles p
LEFT JOIN public.v_user_last_login vul ON vul.user_id = p.id
LEFT JOIN public.user_orgs uo ON uo.user_id = p.id
LEFT JOIN public.org_settings os ON os.org_id = uo.org_id
LEFT JOIN public.user_status_overrides uso ON uso.user_id = p.id AND uso.org_id = uo.org_id
WHERE p.id = 'user-uuid-here';
```

## Success Criteria

✅ **Automatic Dormancy Detection**: Users idle longer than threshold show "Dormant" status
✅ **Admin Override Control**: Admin override disables user regardless of logins  
✅ **Comprehensive Audit**: All status changes captured in audit logs
✅ **Live Status Display**: Identities view shows real-time Status and Dormant badges
✅ **Organization Scoping**: Each org can set different dormancy thresholds
✅ **Security Compliance**: RLS ensures proper access control and tenant isolation
