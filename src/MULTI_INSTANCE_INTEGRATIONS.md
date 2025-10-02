# Multi-Instance Integration Support

## Overview

The integration system now properly separates **connector types** (blueprints like "Azure AD") from **integration instances** (your configured integrations like "Azure AD — Corp Prod", "Azure AD — M&A Tenant").

## Key Changes

### 1. Data Model (`/data/integration-instances.ts`)

- **IntegrationInstance** interface with instance-specific fields:
  - `name` - User-editable instance name (e.g., "Azure AD — Corp Prod")
  - `slug` - Stable identifier derived from name
  - `connectorType` - References the connector blueprint
  - `environment` - prod | sandbox | dev | gov
  - `owner` - Team/person responsible
  - `tags` - For organization and filtering
  - `tenant`, `domain` - Instance-specific metadata
  
- 12 mock instances showing multiple Azure AD, Salesforce, and Workday integrations
- Helper functions for filtering and validation

### 2. Add Integration Wizard Updates

**New Step 0: Instance Basics** (`/components/InstanceBasicsStep.tsx`)
- Always appears as the first step after choosing connector type
- Fields:
  - Instance Name (required, with AI suggestion)
  - Environment (required)
  - Owner (required)
  - Tags (optional)
- Real-time preview card
- Name suggestion helper: "Suggest from type + tenant + env"

**Wizard Flow:**
1. Choose connector type (Azure AD, Workday, etc.)
2. **→ Instance Basics** (NEW)
3. Authentication & Connection
4. Attribute Mapping
5. Scope & Filters
6. Schedule
7. Preflight Checks
8. Summary

### 3. Integration Cards (`/components/IntegrationCard.tsx`)

**Updated Display:**
- **Title** = Instance name (e.g., "Azure AD — Corp Prod")
- **Subtitle** = Connector type + category (e.g., "Azure AD (IdP)")
- **Meta** = Tenant/domain, environment badge

**New Actions (Kebab Menu):**
- **Rename** - Opens modal with validation
- **Duplicate** - Creates a copy with new name
- **Disable/Enable** - Toggle active status
- **Delete** - Removes integration

### 4. Integrations Page Updates (`/pages/IntegrationsPage.tsx`)

**New Filters:**
- **Type** - Filter by connector type (Azure AD, Workday, etc.)
- **Environment** - Production, Sandbox, Dev, Government
- **Status** - Connected, Warning, Disconnected, Syncing
- **Category** - IdP, HRIS, SaaS, Cloud, Directory
- **Owner** - Team responsible

**KPI Stats:**
- Total Integrations: 12
- Connected: 10
- Needs Attention: 2

All filters are interactive and can be combined.

### 5. Integration Detail Page (`/pages/IntegrationDetailPage.tsx`)

**Instance Switcher** (`/components/InstanceSwitcher.tsx`)
- Appears when viewing an instance with other instances of same type
- Dropdown showing all sibling instances
- Quick switch between "Azure AD — Corp Prod" and "Azure AD — M&A Tenant"
- Shows status, environment badge, tenant, owner for each

### 6. Rename Modal (`/components/RenameIntegrationModal.tsx`)

- Validates name uniqueness within org
- Shows info about impact (no config/jobs affected)
- Real-time error states
- Accessible with keyboard support

## Data Flow

```
connector_types (catalog)     integration_instances (your org)
├── azure-ad                  ├── int-az-corp-prod
├── workday              →    │   ├── name: "Azure AD — Corp Prod"
├── salesforce                │   ├── connectorType: "azure-ad"
└── ...                       │   └── environment: "prod"
                              ├── int-az-ma-tenant
                              │   ├── name: "Azure AD — M&A Tenant"
                              │   ├── connectorType: "azure-ad"
                              │   └── environment: "prod"
                              └── ...
```

## API Contract (Mock)

### Create Instance
```typescript
POST /integrations
{
  type: "azure-ad",
  name: "Azure AD — Corp Prod",
  environment: "prod",
  owner: "IdM Team",
  tags: ["production", "critical"],
  settings: { tenantId: "..." }
}
```

### Rename Instance
```typescript
PATCH /integrations/:id
{
  name: "Azure AD — Corporate Production"
}
```

### List Instances
```typescript
GET /integrations?type=azure-ad&environment=prod
// Returns all Azure AD instances in prod
```

## Benefits

1. **Multiple instances per connector type** - Run separate Azure AD for M&A, partners, etc.
2. **Clear naming** - "Azure AD — Corp Prod" vs "Azure AD — M&A Tenant"
3. **Environment-aware** - Separate prod/sandbox/dev with visual badges
4. **Easy management** - Rename, duplicate, disable without reconfiguring
5. **Quick navigation** - Switch between related instances with one click
6. **Better filtering** - Find instances by type, environment, owner, tags
7. **Audit-friendly** - Clear ownership, tags, and metadata

## Edge Cases Handled

- ✅ Duplicate names prevented with validation
- ✅ Rename doesn't break jobs/webhooks (uses immutable ID)
- ✅ Same tenant, different purpose (use tags to differentiate)
- ✅ Instance switcher only shows when >1 instance of same type
- ✅ Filters work across all dimensions (type, env, status, owner)

## Next Steps (If Implementing for Real)

1. **Backend API** - Implement CRUD endpoints for instances
2. **Secrets Management** - Store credentials in vault, reference via `secrets_ref`
3. **Delete Confirmation** - Show impact preview (affected apps/roles/jobs)
4. **Bulk Operations** - Disable/enable multiple instances at once
5. **Instance Templates** - Quick-create from existing instance
6. **Health Monitoring** - Real-time sync status updates
7. **Audit Logging** - Track all instance changes (rename, config updates)

## Files Modified/Created

### Created
- `/data/integration-instances.ts` - Instance data model & mock data
- `/components/InstanceBasicsStep.tsx` - Wizard step for instance basics
- `/components/RenameIntegrationModal.tsx` - Rename UI with validation
- `/components/InstanceSwitcher.tsx` - Switch between related instances

### Modified
- `/components/AddIntegrationWizard.tsx` - Added Instance Basics as step 0
- `/components/IntegrationCard.tsx` - Added kebab menu, rename modal
- `/pages/IntegrationsPage.tsx` - Added instance data, new filters
- `/pages/IntegrationDetailPage.tsx` - Added instance switcher

## Testing

**Test Scenarios:**
1. ✅ View all 12 mock instances on Integrations page
2. ✅ Filter by Type: "Azure AD" → Shows 3 instances
3. ✅ Filter by Environment: "Production" → Shows 9 instances
4. ✅ Click Azure AD instance → Detail page → Instance switcher shows 2 others
5. ✅ Open "Add Integration" → Choose Azure AD → Step 1 is "Instance Basics"
6. ✅ Fill instance name → See preview card update live
7. ✅ Click "Suggest" → Gets smart name from type + tenant + env
8. ✅ Click kebab menu → Rename → Validates uniqueness
9. ✅ Combine filters: Type=Azure AD + Environment=Prod → Shows 2 instances

All functionality is fully accessible and responsive on desktop (1440×900) and mobile (390×844).
