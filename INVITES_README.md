# Invite-Based Onboarding API Documentation

This document describes the invite-based onboarding flow for the IGA platform, providing org-scoped user invitations with full auditability.

## Overview

The invite system allows organization administrators to invite new users to join their organization. Invited users can accept invitations to create accounts and gain access to the organization's resources.

## Architecture

- **Admin-Only Creation**: Only org admins can create invitations
- **Org-Scoped**: All invitations are tied to the creator's organization
- **Single-Use Tokens**: Each invitation can only be accepted once
- **Time-Limited**: Invitations expire after 72 hours (configurable)
- **Fully Auditable**: All actions are logged for compliance

## Environment Variables

### Required
- `PUBLIC_BASE_URL` - Base URL for your application (e.g., `https://your-app.com`)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for invite-accept)

### Optional (for email sending)
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address

## API Endpoints

### POST /functions/v1/invite-create

Creates a new invitation for a user to join the organization.

**Authentication:** Required (JWT token)
**Authorization:** Org admin only

#### Request Body
```json
{
  "email": "user@example.com",
  "role_id": "uuid-optional",
  "expires_hours": 72
}
```

#### Response (Success)
```json
{
  "success": true,
  "invitation_id": "uuid",
  "invite_url": "https://your-app.com/accept-invite?token=uuid",
  "expires_at": "2025-01-15T10:30:00Z",
  "message": "Invitation created successfully"
}
```

#### Response (Error)
```json
{
  "error": "Only org admins can create invitations"
}
```

#### Example cURL
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/invite-create" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@company.com",
    "role_id": "role-uuid-here",
    "expires_hours": 48
  }'
```

### POST /functions/v1/invite-accept

Accepts an invitation and creates/links the user account.

**Authentication:** Not required
**Authorization:** Valid invitation token only

#### Request Body
```json
{
  "token": "invitation-token-uuid",
  "password": "secure-password",
  "name": "John Doe"
}
```

#### Response (New User Created)
```json
{
  "success": true,
  "user_created": true,
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890
  },
  "message": "Account created and invitation accepted successfully"
}
```

#### Response (Existing User)
```json
{
  "success": true,
  "user_created": false,
  "session": null,
  "message": "Invitation accepted successfully. Please log in with your existing credentials."
}
```

#### Example cURL
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/invite-accept" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invitation-token-here",
    "password": "my-secure-password",
    "name": "John Doe"
  }'
```

## Database Schema

### invitations Table
```sql
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  email citext NOT NULL,
  role_id uuid NULL REFERENCES public.roles(id) ON DELETE SET NULL,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Indexes
- `idx_invitations_org_email` on `(org_id, email)`
- `idx_invitations_token` on `(token)`
- `idx_invitations_expires_at` on `(expires_at)`

## Row Level Security (RLS)

### Policies
- **SELECT**: Only org admins can view invitations for their organization
- **INSERT**: Only org admins can create invitations for their organization
- **UPDATE**: Only org admins can update invitations for their organization
- **DELETE**: Only org admins can delete invitations for their organization

### Enforcement
- All policies use `current_org_id()` to ensure org-scoped access
- `is_org_admin()` function validates admin privileges
- Cross-org access is prevented by RLS

## Email Template

The system includes an HTML email template (`email-template.html`) with:
- Organization branding
- Inviter information
- Clear call-to-action button
- Expiry warning
- Fallback text link
- Professional styling

### Template Variables
- `{{org_name}}` - Organization name
- `{{inviter_name}}` - Name of the person who sent the invitation
- `{{invite_url}}` - Complete invitation URL with token
- `{{expires_at}}` - Human-readable expiry date/time

## Testing Without SMTP

When SMTP is not configured, the `invite-create` endpoint returns the `invite_url` in the response. You can:

1. Copy the URL from the response
2. Open it in a browser
3. Complete the invitation acceptance form
4. Verify the user appears in `/identities`

## Security Features

### Token Security
- **Unique**: Each invitation has a unique UUID token
- **Single-Use**: Tokens are marked as used after acceptance
- **Time-Limited**: Tokens expire after specified hours
- **Unpredictable**: Generated using `gen_random_uuid()`

### Access Control
- **Admin-Only Creation**: Only org admins can create invitations
- **Org Isolation**: Users can only see invitations for their organization
- **RLS Enforcement**: Database-level security prevents cross-org access

### Audit Trail
All actions generate audit log entries:
- `INVITE_CREATED` - When invitation is created
- `INVITE_ACCEPTED` - When invitation is accepted

Audit entries include:
- Actor (who performed the action)
- Subject (invitation)
- Object ID (invitation ID)
- Metadata (email, org, role, etc.)

## Error Handling

### Common Errors
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - User is not an org admin
- `400 Bad Request` - Invalid email or missing required fields
- `409 Conflict` - Active invitation already exists for email
- `400 Bad Request` - Invalid or expired invitation token

### Idempotency
- **invite-create**: Safe to retry (checks for existing invitations)
- **invite-accept**: Safe to retry (checks if already accepted)

## Integration with Identities API

After accepting an invitation, the new user will immediately appear in the `/identities` endpoint with:
- Correct organization membership
- Assigned roles (if specified)
- Proper RLS filtering
- Complete audit trail

## Maintenance

### Cleanup Expired Invitations
Run the cleanup function periodically:
```sql
SELECT public.cleanup_expired_invitations();
```

This removes expired, unaccepted invitations to keep the database clean.

## Future Enhancements

1. **Email Integration**: Full SMTP support with template rendering
2. **Bulk Invitations**: Invite multiple users at once
3. **Custom Expiry**: Per-invitation expiry times
4. **Invitation Resending**: Resend expired invitations
5. **Invitation Revocation**: Cancel pending invitations
6. **Advanced Roles**: Support for custom role assignments
7. **Invitation Templates**: Customizable email templates per organization
