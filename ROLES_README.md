# Role-Based Access Control (RBAC) System

This document describes the complete RBAC implementation for the IAM platform. The system provides fine-grained access control through roles and permissions with organization-scoped isolation.

## Overview

The RBAC system provides:
- **Role-based permissions** with organization scoping
- **Fine-grained access control** through permission keys
- **Administrative role management** via APIs
- **JWT token enrichment** with roles and permissions
- **Comprehensive audit logging** for all role operations
- **Real-time permission checking** functions

## Architecture

### Database Schema

#### `roles` Table
Defines roles within an organization:
```sql
roles (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES orgs(id),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, name)
)
```

#### `permissions` Table
Global permission definitions:
```sql
permissions (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
)
```

#### `role_permissions` Table
Links roles to their permissions:
```sql
role_permissions (
  id uuid PRIMARY KEY,
  role_id uuid REFERENCES roles(id),
  permission_id uuid REFERENCES permissions(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
)
```

#### `role_assignments` Table
Assigns roles to users:
```sql
role_assignments (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  org_id uuid REFERENCES orgs(id),
  role_id uuid REFERENCES roles(id),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, org_id, role_id)
)
```

### Table Relationships

```
orgs (1) ←→ (N) roles
roles (1) ←→ (N) role_permissions ←→ (N) permissions
roles (1) ←→ (N) role_assignments ←→ (N) users
```

## Base Permissions

The system comes with these foundational permissions:

| Permission Key | Description |
|----------------|-------------|
| `invite_create` | Create and send user invitations |
| `identity_view` | View user identities and profiles |
| `identity_edit` | Edit user identities and profiles |
| `audit_view` | View audit logs and activity history |
| `role_manage` | Create, edit, and assign roles |
| `org_settings_edit` | Edit organization settings |
| `user_disable` | Disable or enable user accounts |
| `certification_manage` | Manage certification campaigns |
| `policy_manage` | Create and manage access policies |
| `integration_manage` | Manage system integrations |
| `report_view` | View and generate reports |
| `risk_assess` | Assess and manage user risk levels |

## Base Roles

Each organization gets these default roles:

### Org Admin
- **Permissions**: All permissions
- **Description**: Full administrative access to all organization features
- **Use Case**: Organization administrators and super users

### Manager
- **Permissions**: `invite_create`, `identity_view`, `identity_edit`, `user_disable`, `report_view`
- **Description**: Can manage users and view reports
- **Use Case**: Department managers and team leads

### Reviewer
- **Permissions**: `identity_view`, `audit_view`, `report_view`
- **Description**: Can view identities and audit logs for review purposes
- **Use Case**: Compliance officers and auditors

## API Endpoints

### Role Management API

Base URL: `/functions/v1/role-management`

#### GET /roles
List all roles for the current organization.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "role-uuid",
      "name": "Manager",
      "description": "Can manage users and view reports",
      "permissions": ["invite_create", "identity_view"],
      "permission_count": 2,
      "assigned_user_count": 5
    }
  ]
}
```

#### POST /roles
Create a new role (admin only).

**Request:**
```json
{
  "name": "Custom Role",
  "description": "Custom role description",
  "permissions": ["identity_view", "audit_view"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "role-uuid",
    "name": "Custom Role",
    "permissions": ["identity_view", "audit_view"]
  }
}
```

#### GET /permissions
List all available permissions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "permission-uuid",
      "key": "identity_view",
      "description": "View user identities and profiles"
    }
  ]
}
```

#### POST /role-assignments
Assign a role to a user (admin only).

**Request:**
```json
{
  "user_id": "user-uuid",
  "role_id": "role-uuid",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "assignment_id": "assignment-uuid",
    "role_name": "Manager",
    "user_name": "John Doe",
    "assigned_at": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE /role-assignments/:id
Remove a role assignment (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Role removed successfully"
}
```

## Database Views

### v_user_roles
Aggregate all roles a user has:
```sql
SELECT user_id, org_id, role_names, role_count
FROM public.v_user_roles
WHERE user_id = 'user-uuid';
```

### v_role_permissions
Aggregate permission keys for each role:
```sql
SELECT role_id, role_name, permission_keys, permission_count
FROM public.v_role_permissions
WHERE role_name = 'Manager';
```

### v_effective_permissions
Resolve user permissions by joining role assignments → role_permissions → permissions:
```sql
SELECT user_id, permissions, roles, permission_count, role_count
FROM public.v_effective_permissions
WHERE user_id = 'user-uuid';
```

### v_user_role_assignments
Detailed view of user role assignments:
```sql
SELECT 
  assignment_id, role_name, user_name, assigned_at, 
  expires_at, assignment_status
FROM public.v_user_role_assignments
WHERE user_id = 'user-uuid';
```

### v_role_details
Role information with permission summary:
```sql
SELECT 
  id, name, description, permissions, 
  permission_count, assigned_user_count
FROM public.v_role_details
ORDER BY name;
```

## SQL Functions

### Permission Checking Functions

#### Check if user has specific permission
```sql
SELECT public.user_has_permission('user-uuid', 'identity_view');
```

#### Get user's effective permissions
```sql
SELECT permissions, roles 
FROM public.get_user_permissions('user-uuid');
```

#### Check current user's permissions
```sql
SELECT public.current_user_has_permission('identity_view');
SELECT public.current_user_has_any_permission(array['identity_view', 'audit_view']);
SELECT public.current_user_has_all_permissions(array['identity_view', 'audit_view']);
```

### Role Management Functions

#### Create role with permissions
```sql
SELECT public.create_role(
  'Custom Role',
  'Role description',
  array['identity_view', 'audit_view']
);
```

#### Assign role to user
```sql
SELECT public.assign_role(
  'user-uuid',
  'role-uuid',
  '2024-12-31T23:59:59Z'::timestamptz
);
```

#### Remove role from user
```sql
SELECT public.remove_role('user-uuid', 'role-uuid');
```

## JWT Token Enrichment

The JWT enrichment function now includes RBAC data:

```json
{
  "org_id": "org-uuid",
  "is_org_admin": true,
  "roles": ["Org Admin", "Manager"],
  "permissions": ["invite_create", "identity_view", "role_manage"],
  "role_count": 2,
  "permission_count": 3
}
```

### Using JWT Claims in Frontend

```javascript
// Get user's roles from JWT
const roles = user.jwt.roles || [];

// Check if user has specific permission
const hasPermission = user.jwt.permissions?.includes('identity_view');

// Check if user is admin
const isAdmin = user.jwt.is_org_admin;
```

## Adding New Permissions

### 1. Add Permission to Database
```sql
INSERT INTO public.permissions (key, description) 
VALUES ('new_permission', 'Description of new permission');
```

### 2. Update Role Permissions
```sql
-- Add permission to existing role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'Manager' AND p.key = 'new_permission';
```

### 3. Update Frontend Code
```javascript
// Add permission check in components
if (user.jwt.permissions?.includes('new_permission')) {
  // Show feature
}
```

## Security Rules

### Organization Isolation
- All role operations are scoped to `current_org_id()`
- Users can only see roles and assignments within their organization
- Cross-organization access is prevented by RLS policies

### Admin-Only Operations
- Only users with `is_org_admin=true` can:
  - Create, edit, or delete roles
  - Assign or remove roles from users
  - Modify role permissions
  - Manage organization settings

### Audit Logging
All role operations are logged:
- `ROLE_CREATED`: When a new role is created
- `ROLE_ASSIGNED`: When a role is assigned to a user
- `ROLE_REMOVED`: When a role is removed from a user
- `BASE_ROLES_CREATED`: When base roles are created for an organization

## Testing with JWT Claims

### 1. Get User's JWT Token
```bash
# Login and get JWT
curl -X POST "https://your-project.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### 2. Decode JWT Claims
```javascript
// Decode JWT payload
const payload = JSON.parse(atob(jwt.split('.')[1]));
console.log('Roles:', payload.roles);
console.log('Permissions:', payload.permissions);
console.log('Is Admin:', payload.is_org_admin);
```

### 3. Test Permission Checks
```sql
-- Check current user's permissions
SELECT * FROM public.get_current_user_rbac();

-- Test specific permission
SELECT public.current_user_has_permission('identity_view');
```

## Common Use Cases

### 1. Role Assignment Workflow
```sql
-- 1. Create custom role
SELECT public.create_role(
  'Data Analyst',
  'Can view reports and audit logs',
  array['report_view', 'audit_view']
);

-- 2. Assign role to user
SELECT public.assign_role(
  'user-uuid',
  'role-uuid'
);

-- 3. Verify assignment
SELECT * FROM public.v_user_role_assignments 
WHERE user_id = 'user-uuid';
```

### 2. Permission-Based UI Rendering
```javascript
// React component example
function IdentityTable() {
  const { user } = useAuth();
  
  return (
    <div>
      {user.jwt.permissions?.includes('identity_view') && (
        <table>
          {/* Identity table */}
        </table>
      )}
      
      {user.jwt.permissions?.includes('identity_edit') && (
        <button>Edit User</button>
      )}
    </div>
  );
}
```

### 3. API Permission Checks
```javascript
// Edge Function example
const hasPermission = await supabase
  .rpc('current_user_has_permission', { p_permission_key: 'identity_edit' });

if (!hasPermission) {
  return new Response('Forbidden', { status: 403 });
}
```

## Monitoring and Maintenance

### Key Metrics to Monitor
1. **Role Assignment Volume**: Track role assignment frequency
2. **Permission Usage**: Monitor which permissions are most used
3. **Admin Activity**: Track administrative role operations
4. **Expired Assignments**: Monitor role assignments approaching expiry

### Maintenance Tasks
1. **Clean Expired Assignments**: Remove expired role assignments
2. **Audit Role Usage**: Review unused roles and permissions
3. **Update Base Roles**: Modify default roles as needed
4. **Permission Reviews**: Regular review of permission assignments

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if user has required permission
2. **Role Not Found**: Verify role exists in current organization
3. **JWT Not Updated**: Clear browser cache and re-login
4. **RLS Blocking**: Check organization scoping and admin status

### Debug Queries

```sql
-- Check user's current RBAC context
SELECT * FROM public.get_current_user_rbac();

-- Verify role assignments
SELECT * FROM public.v_user_role_assignments 
WHERE user_id = 'user-uuid';

-- Check effective permissions
SELECT * FROM public.v_effective_permissions 
WHERE user_id = 'user-uuid';

-- Audit recent role operations
SELECT * FROM public.audit_logs 
WHERE action LIKE 'ROLE_%' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Success Criteria

✅ **Admin can assign/remove roles** from users in their org  
✅ **APIs correctly restrict** to current_org_id()  
✅ **UI can show each user's role(s)** in the Identities table  
✅ **JWT claims accurately reflect** assigned roles and permissions  
✅ **All actions logged** in audit_logs  
✅ **Organization isolation** enforced by RLS policies  
✅ **Permission-based access control** implemented throughout the system
