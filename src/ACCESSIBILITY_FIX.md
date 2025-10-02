# Accessibility Fix: Dialog/Sheet Description Requirements

## Issue
Radix UI Dialog and Sheet components require either a `Description` component or an explicit `aria-describedby={undefined}` to meet accessibility standards.

**Warning:** `Missing Description or aria-describedby={undefined} for {DialogContent}`

## Root Cause
Radix UI enforces WCAG accessibility guidelines by requiring dialogs to have a description that screen readers can announce to users. This helps users understand the purpose of the dialog before interacting with it.

## Fix Applied

### AccountDetailDrawer.tsx
**Status:** ✅ Fixed

Added `SheetDescription` to provide context for screen readers:

```tsx
// Import added
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

// In component render:
<SheetHeader className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
  <SheetTitle
    className="mb-2"
    style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}
  >
    {account.username || account.email}
  </SheetTitle>
  <SheetDescription className="sr-only">
    View and manage account details including attributes, mappings, and activity for {account.username || account.email}
  </SheetDescription>
  {/* rest of header content */}
</SheetHeader>
```

**Note:** Used `className="sr-only"` to hide the description visually while keeping it accessible to screen readers, maintaining the clean visual design.

## Components Already Compliant

The following components already had proper descriptions:

### ✅ IdentityDetailDrawer.tsx
```tsx
<SheetTitle className="sr-only">
  {identity.name} - Identity Details
</SheetTitle>
<SheetDescription className="sr-only">
  View and manage identity information, access details, activity history, and AI-powered suggestions for {identity.name}
</SheetDescription>
```

### ✅ IntegrationDrawer.tsx
```tsx
<SheetDescription className="sr-only">
  View details and quick actions for {integration.name} integration
</SheetDescription>
```

### ✅ RequestsPage.tsx (Detail Sheet)
```tsx
<SheetTitle className="sr-only">
  Request {selectedRequest.id} Details
</SheetTitle>
<SheetDescription className="sr-only">
  View and manage access request {selectedRequest.id}
</SheetDescription>
```

### ✅ RequestsPage.tsx (Filters Sheet)
```tsx
<SheetDescription style={{ fontSize: '13px' }}>
  Filter requests by status, risk level, and department
</SheetDescription>
```

### ✅ All Dialog Components
All Dialog components (IdentityLinkingModal, RenameIntegrationModal, SoDConflictModal, etc.) already include DialogDescription elements.

## Accessibility Best Practices

### When to Use sr-only
Use `className="sr-only"` when:
- The description is redundant with visible UI elements
- You want to maintain a clean visual design
- Screen reader users still need context

### When to Show Description
Show the description when:
- It provides valuable context to all users
- The purpose isn't immediately obvious from the title
- The dialog contains complex or critical actions

### Pattern to Follow

```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>
        {/* Clear, concise title */}
      </SheetTitle>
      <SheetDescription className="sr-only">
        {/* Detailed description for screen readers */}
      </SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

## WCAG Compliance

This fix ensures compliance with:
- **WCAG 2.1 Level AA** - 4.1.2 Name, Role, Value
- **ARIA Best Practices** - Dialog/Modal patterns
- **Screen Reader Support** - NVDA, JAWS, VoiceOver compatibility

## Testing Checklist

- [x] All Sheet components have SheetDescription
- [x] All Dialog components have DialogDescription  
- [x] Screen-reader-only descriptions use sr-only class
- [x] Visible descriptions have proper styling
- [x] No accessibility warnings in console
- [x] Focus management works correctly
- [x] Keyboard navigation intact

## Related Components

### ShadCN UI Components Using Descriptions
- `Dialog` → requires `DialogDescription`
- `Sheet` → requires `SheetDescription`
- `AlertDialog` → requires `AlertDialogDescription`
- `Drawer` → requires `DrawerDescription`

All of these are based on Radix UI primitives which enforce accessibility requirements.

## Future Considerations

1. **Automated Testing**: Add accessibility tests to catch missing descriptions in CI/CD
2. **Lint Rules**: Consider adding ESLint rules to enforce description requirements
3. **Component Templates**: Update component templates to include descriptions by default
4. **Documentation**: Update Guidelines.md with accessibility requirements

## Resources

- [Radix UI Dialog Accessibility](https://www.radix-ui.com/primitives/docs/components/dialog#accessibility)
- [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
