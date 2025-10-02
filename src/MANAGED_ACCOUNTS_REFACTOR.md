# Managed Accounts Table Refactor

## Overview
Refactored the Managed Accounts table to eliminate horizontal scrolling while maintaining full access to all account attributes through a lean table + drawer pattern.

## Key Changes

### 1. Lean Table Design (7 Core Columns)
The table now shows only essential columns by default:
- **Email/UPN** - Primary identifier (shows username as secondary if different)
- **Identity** - Link status with avatar and quick-link actions
- **Status** - Active, Disabled, Orphaned, Pending badges
- **Last Sync** - Relative time (e.g., "2h ago")
- **Groups/Roles** - Count of group memberships
- **Source ID** - Immutable external key (objectId, workerID, etc.)
- **Attributes** - Peek popover showing top 3 attributes

### 2. Attributes Peek Popover
- Shows top 3 most relevant attributes in a hover popover
- Displays count of remaining attributes
- Includes copy buttons for each value
- Hints to click the row to view all attributes

### 3. Enhanced Detail Drawer
The right-side drawer provides comprehensive attribute views:

#### Tabs
- **Overview** - Core info and identity link status
- **Attributes** - Full attribute grid with:
  - Searchable key-value grid
  - 3-column responsive layout
  - Copy buttons on hover
  - Grid/JSON view toggle
  - Secret masking in Grid view
- **Mappings** - Source → Profile attribute mappings
- **Activity** - Recent provisioning events and logins

#### Search Functionality
- Real-time attribute search
- Filters by both key and value
- Maintains layout and interaction

### 4. Column Picker (Power Users)
- Available but not shown by default
- Allows adding specific attribute columns for troubleshooting
- Includes presets:
  - **Core** - Default 7 columns
  - **Troubleshooting** - Core + Last Login, MFA, Department, Job Title
  - **Identity Matching** - Core + employeeId, workerID, manager, location
- Searchable column list
- Clear indication when extra columns are active

### 5. Export Functionality
- Exports all attributes by default
- Includes selected columns if Column Picker is active
- CSV format with proper escaping

## Design Benefits

### ✅ No Horizontal Scrolling
The default view fits comfortably in 1440px viewports without scrolling

### ✅ Progressive Disclosure
- Quick scan: See essential info in table
- Quick peek: Hover Attributes column for top 3
- Deep dive: Click row for full drawer with search

### ✅ Enterprise Accessibility
- WCAG AA compliant contrast
- Keyboard navigation support
- Focus indicators on all interactive elements
- Screen reader friendly

### ✅ Power User Friendly
- Column picker available for custom views
- Preset configurations for common workflows
- Full export capability

## User Workflows

### Standard User Flow
1. Scan table for account status
2. Hover "Attributes" column to peek at key fields
3. Click row to open drawer for full details
4. Use search in drawer to find specific attributes
5. Copy values as needed

### Power User Flow
1. Click "Columns" button
2. Select preset (e.g., "Troubleshooting")
3. Table shows additional attribute columns
4. Export data with all fields for analysis

### Troubleshooting Flow
1. Apply "Troubleshooting" preset
2. Scan table for anomalies (MFA, login times)
3. Click problematic accounts
4. Review mappings and activity tabs
5. Link/unlink identities as needed

## Technical Implementation

### Components Modified
- `ManagedAccountsTable.tsx` - Lean table with conditional extra columns
- `AccountDetailDrawer.tsx` - Enhanced with search and hints
- `KeyValueGrid.tsx` - Added searchable prop and filtering
- `ColumnPicker.tsx` - Updated help text for power users
- `AttributesPeekPopover.tsx` - Enhanced hint styling

### State Management
- `showExtraColumns` - Tracks if Column Picker has been used
- `selectedColumns` - Array of additional columns to display
- `searchQuery` - Filters attributes in drawer grid view

### Performance Considerations
- Memoized filtered results for search
- Conditional rendering of extra columns
- Efficient row click handlers

## Future Enhancements

### Potential Additions
- [ ] Attribute grouping chips (Core, Identity, HR, Security, Custom)
- [ ] "Pin" favorite attributes in drawer
- [ ] "Show only changed" filter in attributes
- [ ] Column width persistence in user preferences
- [ ] Bulk operations on selected accounts

### Analytics Opportunities
- Track which attributes are most frequently viewed
- Optimize preset configurations based on usage
- Surface most common troubleshooting patterns