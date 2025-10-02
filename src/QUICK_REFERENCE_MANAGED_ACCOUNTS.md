# Managed Accounts - Quick Reference Guide

## 🎯 Quick Actions

### View Account Details
1. Click any row in the table
2. Drawer opens on the right
3. Navigate tabs: Overview | Attributes | Mappings | Activity

### Search Attributes
1. Click any account row
2. Go to "Attributes" tab
3. Type in search box
4. Results filter in real-time

### Peek at Key Attributes
- Hover over the "Attributes" column
- See top 3 most relevant attributes
- Click copy button to copy values

### Link Account to Identity
1. Find account with "Unlinked" status
2. Click the account row OR click "Link" chip
3. Review match candidates
4. Select and confirm link

### Add Custom Columns (Power Users)
1. Click [Columns ▾] button in toolbar
2. Choose a preset OR search for specific attributes
3. Check/uncheck columns
4. Table updates immediately

### Export Accounts
1. Apply filters (Status, Link Status)
2. Search if needed
3. Click [Export] button
4. CSV downloads with all attributes

---

## 📊 Table Columns Explained

| Column | Description | Examples |
|--------|-------------|----------|
| **Email/UPN** | Primary email identifier. Shows username as secondary if different | `sarah.chen@acme.com`<br/>`@schen` |
| **Identity** | Linked identity with avatar. Shows link status chip if unlinked | `👤 Sarah Chen`<br/>`✓ Linked` |
| **Status** | Account status in source system | Active, Disabled, Orphaned, Pending |
| **Last Sync** | When account was last synced from connector | `2h ago`, `Yesterday`, `Jan 15` |
| **Groups/Roles** | Count of groups/roles assigned | `12` |
| **Source ID** | Immutable external identifier (objectId, workerID, etc) | `8a7b6c5d-4e3f-...` |
| **Attributes** | Peek at top 3 attributes. Click for popover. | `[3 attrs] +12 more ⋮` |

---

## 🔍 Filters & Search

### Search Bar
Searches across:
- Username
- Email/UPN
- Source ID
- Linked identity name

### Status Filter
- **All Status** - Show everything
- **Active** - Active accounts only
- **Disabled** - Disabled accounts
- **Orphaned** - No longer in source system
- **Pending** - Provisioning in progress

### Link Status Filter
- **All Links** - Show all accounts
- **Linked** - Accounts linked to identities
- **Unlinked** - Accounts not yet linked
- **Ambiguous** - Multiple potential matches

---

## 📋 Drawer Tabs

### Overview Tab
Shows core account information and identity link status:
- Account status, sync time, groups
- Organization details (dept, title, office)
- Identity link card with actions

### Attributes Tab
Full attribute grid with advanced features:
- **Search** - Filter by key or value
- **Grid View** - 3-column layout with copy buttons
- **JSON View** - Raw JSON payload
- **Secret Masking** - Credentials hidden in Grid view

### Mappings Tab
Shows how connector attributes map to identity profile:
- Source attribute → Target field
- Values from both sides
- Match/Mismatch status
- Useful for troubleshooting sync issues

### Activity Tab
Recent events and usage:
- Sync events
- Login events
- Provisioning changes
- Profile updates

---

## 🎨 Column Presets

### Core (Default)
Standard 7 columns. No horizontal scrolling.
```
Email/UPN | Identity | Status | Last Sync | Groups | Source ID | Attributes
```

### Troubleshooting
Core + diagnostic attributes
```
Core columns + Last Login | MFA Enabled | Department | Job Title
```

### Identity Matching
Core + attributes used for identity linking
```
Core columns + Employee ID | Worker ID | Manager | Office Location
```

---

## 💡 Pro Tips

### Keyboard Shortcuts
- `Tab` - Navigate between filters and controls
- `Enter` - Apply filter selection
- `Esc` - Close drawer or modal
- `Ctrl/Cmd + F` - Browser search (use table search instead)

### Workflow Optimization
1. **Daily Review**: Apply Status filter to "Orphaned" to find stale accounts
2. **Onboarding**: Filter by "Pending" to track new provisions
3. **Identity Hygiene**: Filter "Unlinked" to resolve identity matches
4. **Audit**: Export with filters to create compliance reports

### Common Patterns
- **Find user**: Use search bar (searches email, username, name)
- **Check MFA**: Add "Troubleshooting" preset
- **Verify mapping**: Click account → Mappings tab
- **Track changes**: Click account → Activity tab

### Performance Tips
- Use filters before searching to reduce result set
- Keep extra columns minimal (use drawer for deep inspection)
- Export applies current filters (filter first, then export)

---

## 🆘 Troubleshooting

### "Account shows as Orphaned"
1. Click account to open drawer
2. Check Activity tab for last sync
3. Verify account still exists in source system
4. Check integration status on main page

### "Can't find user"
1. Clear all filters (Status: All, Link Status: All)
2. Search by email or source ID
3. Check if account was synced recently
4. Review integration sync logs

### "Attributes not updating"
1. Click account → Mappings tab
2. Verify source attribute exists
3. Check if mapping status shows "Matched"
4. Review last sync time in Overview

### "Too many columns"
1. Click [Columns ▾] button
2. Click [Clear] to reset
3. Use drawer for detailed inspection instead

---

## 🔐 Security & Privacy

### Data Masking
- Credentials/secrets masked in Grid view
- JSON view shows raw data (admin access only)
- Export includes all attributes (review before sharing)

### Access Control
- End users: View own linked accounts
- Admins: View all accounts, manage links
- Approvers: View accounts in approval context

### Compliance
- All actions logged in Activity tab
- Export includes timestamp and user
- WCAG AA compliant for accessibility

---

## 📚 Related Docs

- [MANAGED_ACCOUNTS_REFACTOR.md](./MANAGED_ACCOUNTS_REFACTOR.md) - Technical details
- [BEFORE_AFTER_COMPARISON.md](./BEFORE_AFTER_COMPARISON.md) - Visual comparison
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Overall app architecture