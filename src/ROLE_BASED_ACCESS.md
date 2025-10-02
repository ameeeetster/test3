# Role-Based Access Control (RBAC) Implementation

## Overview

The IAM Platform implements a comprehensive role-based access control system with three distinct user personas: **End User**, **Approver**, and **Administrator**. Each role has different permissions, navigation access, and dashboard views.

## User Roles

### 1. End User
**Purpose**: Standard employees who need to request access to applications and resources.

**Permissions**:
- View their own dashboard
- View their own access requests
- Create new access requests

**Dashboard Features**:
- Personal welcome message
- Quick stats: Active Access, Pending Requests, Total Requests
- Quick action button to create new requests
- Recent requests with status tracking

**Navigation Access**:
- Home
- Requests (own requests only)

---

### 2. Approver
**Purpose**: Team leads and managers who review and approve access requests for their team members.

**Permissions**:
- All End User permissions
- View pending approvals
- Approve/reject access requests
- View team member identities
- View reports

**Dashboard Features**:
- Approvals-focused dashboard
- Quick stats: Pending Approvals, Approved Today, Team Members, High Risk Items
- High-priority alert for risky requests
- Pending approvals list with quick approve/reject actions
- SoD conflict indicators

**Navigation Access**:
- Home
- Requests
- Approvals
- Identities (view only)
- Reports

---

### 3. Administrator
**Purpose**: IT and Security teams who manage the entire IAM platform.

**Permissions**:
- All Approver permissions
- View all requests (not just team members)
- Manage identities
- Manage roles and entitlements
- Manage access reviews
- View and manage risk
- Manage integrations
- Access settings

**Dashboard Features**:
- Comprehensive analytics dashboard
- System-wide statistics and metrics
- AI-powered insights and recommendations
- Request volume trends
- Risk analysis by application
- Recent activity across the platform
- System alerts and notifications

**Navigation Access**:
- All navigation items:
  - Home
  - Requests
  - Approvals
  - Identities
  - Access (Roles & Entitlements)
  - Reviews
  - Risk
  - Reports
  - Integrations
  - Settings

## Implementation Architecture

### Core Components

#### 1. User Context (`/contexts/UserContext.tsx`)
- Manages current user state and role
- Provides permission checking functionality
- Includes `hasPermission()` method for granular access control
- Demo role-switching capability

#### 2. Role Switcher (`/components/RoleSwitcher.tsx`)
- Dropdown component in top bar (desktop only)
- Allows switching between roles for demo purposes
- Shows active role with badge
- Includes role descriptions

#### 3. App Shell (`/components/AppShell.tsx`)
- Filters navigation items based on user permissions
- Displays user information from context
- Responsive sidebar with role-based menu items

#### 4. Role-Specific Dashboards
- `/pages/home/EndUserDashboard.tsx` - Personal request tracking
- `/pages/home/ApproverDashboard.tsx` - Team approval management
- `/pages/HomePage.tsx` - Administrator analytics (default)

### Permission System

Permissions are defined as string constants and mapped to roles:

```typescript
type Permission = 
  | 'view:dashboard'
  | 'view:my-requests'
  | 'create:request'
  | 'view:approvals'
  | 'approve:requests'
  | 'view:all-requests'
  | 'view:identities'
  | 'manage:identities'
  | 'view:roles'
  | 'manage:roles'
  | 'view:reviews'
  | 'manage:reviews'
  | 'view:risk'
  | 'manage:risk'
  | 'view:reports'
  | 'view:integrations'
  | 'manage:integrations'
  | 'view:settings'
  | 'manage:settings';
```

### Usage Example

```typescript
import { useUser } from '../contexts/UserContext';

function MyComponent() {
  const { user, hasPermission } = useUser();

  if (!hasPermission('manage:identities')) {
    return <NoAccessView />;
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      {/* Component content */}
    </div>
  );
}
```

## Switching Roles (Demo Mode)

For demonstration purposes, use the Role Switcher in the top navigation bar:

1. Click the role button (shows current role, e.g., "Administrator")
2. Select a different role from the dropdown
3. The application will instantly update:
   - Navigation menu changes
   - Dashboard view changes
   - Available features adapt to the new role

## Extending the System

### Adding New Permissions

1. Add the permission to the `Permission` type in `/contexts/UserContext.tsx`
2. Update the `rolePermissions` map to include the new permission for appropriate roles
3. Use `hasPermission()` in components to check access

### Adding New Roles

1. Add the role to the `UserRole` type
2. Define permissions in `rolePermissions` map
3. Add role label and description in utility functions
4. Create role-specific dashboard if needed
5. Update HomePage routing logic

### Adding Navigation Items

Add items to the `navItems` array in `/components/AppShell.tsx`:

```typescript
{ 
  name: 'New Feature', 
  path: '/new-feature', 
  icon: IconComponent, 
  permission: 'view:new-feature' 
}
```

## Production Considerations

For production deployment:

1. **Remove Role Switcher**: Comment out or remove the `<RoleSwitcher />` component
2. **Integrate Authentication**: Replace demo user with real authentication (Auth0, Okta, etc.)
3. **Backend Integration**: Validate permissions server-side
4. **Role Assignment**: Implement admin interface for assigning roles to users
5. **Audit Logging**: Log all role changes and permission checks
6. **Session Management**: Implement secure session handling
7. **Multi-tenancy**: Consider tenant-level isolation if needed

## Security Best Practices

- Always validate permissions on both client and server
- Never expose sensitive data based solely on frontend permission checks
- Implement proper session timeouts
- Log all access attempts for audit purposes
- Use principle of least privilege when assigning roles
- Regularly review and update permission mappings

## Testing Different Roles

To test the application as different users:

1. **End User Experience**: Switch to "End User" role to see limited access focused on personal requests
2. **Approver Experience**: Switch to "Approver" role to see team management and approval workflows
3. **Administrator Experience**: Switch to "Administrator" role to see full platform capabilities

Each role provides a tailored experience optimized for that user's responsibilities and needs.