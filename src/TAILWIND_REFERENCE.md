# IAM Platform - Tailwind & Design System Reference

## CSS Variable Mapping

### Colors
```css
/* Light Mode */
--bg: #FFFFFF
--surface: #F8FAFC
--text: #0F172A
--text-secondary: #475569
--muted-foreground: #64748B
--primary: #4F46E5
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
--info: #0EA5E9
--border: #E2E8F0

/* Dark Mode */
--bg: #0A0E1A
--surface: #111827
--text: #F1F5F9
--primary: #6366F1
```

### Spacing Scale (8px grid)
```
2px  → space-1
4px  → space-2
6px  → space-3
8px  → space-4
12px → space-5
16px → space-6
20px → space-7
24px → space-8
32px → space-10
40px → space-12
48px → space-16
64px → space-20
```

### Typography Scale
```
11px → text-xs
12px → text-sm
13px → text-base
14px → text-body (default)
16px → text-md
18px → text-lg
20px → text-xl
24px → text-2xl
30px → text-3xl
36px → text-4xl
```

### Border Radius (Enterprise - Reduced)
```
4px  → radius-xs (badges, pills)
6px  → radius-sm (chips, small elements)
8px  → radius-md (buttons, inputs, cards)
10px → radius-lg (large cards)
12px → radius-xl (modals, panels)
```

**Rationale:** Reduced from heavy rounded (24px) to professional rounded (8-12px) for enterprise aesthetic.

### Shadows
```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 2px 8px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)
--shadow-lg: 0 8px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)
--shadow-xl: 0 16px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)
```

---

## Component Patterns

### Alert Bar (Critical Notifications)
```tsx
<AlertBar
  variant="danger"
  title="3 Segregation of Duties conflicts detected"
  description="Users have conflicting roles that violate SoD policies"
  action={{
    label: 'Review Conflicts',
    onClick: () => handleReview()
  }}
  onDismiss={() => setShowAlert(false)}
/>

// Variants: 'danger' | 'warning' | 'info'
// Style: rounded-lg border p-3 with semantic colors
```

### Cards
```tsx
// Basic Card (Enterprise Style)
<Card 
  className="p-5 transition-all duration-150"
  style={{ 
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)'
  }}
>
  Content
</Card>

// Hover Effect (Subtle)
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
  e.currentTarget.style.transform = 'translateY(-1px)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
  e.currentTarget.style.transform = 'translateY(0)';
}}
```

### KPI/Stat Cards (Enterprise with Sparkline)
```tsx
<Card 
  className="group p-5 transition-all duration-150 cursor-pointer"
  style={{ 
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)'
  }}
>
  {/* Header: Title + Icon (top-right) */}
  <div className="flex items-start justify-between mb-3">
    <p style={{ 
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
      fontWeight: 'var(--font-weight-medium)'
    }}>
      Pending Approvals
    </p>
    <div 
      className="w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)'
      }}
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />
    </div>
  </div>
  
  {/* Value (32px, semibold, tight tracking) */}
  <h3 
    className="tracking-tight"
    style={{ 
      fontSize: '32px',
      lineHeight: '1.2',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--text)',
      marginBottom: '8px'
    }}
  >
    24
  </h3>
  
  {/* Delta Chip with Arrow */}
  <div className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 mb-3" style={{ 
    fontSize: '11px',
    backgroundColor: 'rgb(236 253 245 / 1)',
    color: 'rgb(21 128 61 / 1)',
    fontWeight: 'var(--font-weight-semibold)'
  }}>
    <span>▲</span>
    <span>+3 today</span>
  </div>
  
  {/* Sparkline (32px height) */}
  <ResponsiveContainer width="100%" height={32}>
    <LineChart data={sparklineData}>
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke="var(--primary)" 
        strokeWidth={1.5}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
</Card>
```

### Badges/Chips
```tsx
// Success
<Badge style={{ 
  backgroundColor: 'var(--success)15',
  color: 'var(--success)',
  border: '1px solid var(--success)30',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)'
}}>
  Active
</Badge>

// Danger
<Badge style={{ 
  backgroundColor: 'var(--danger)15',
  color: 'var(--danger)',
  border: '1px solid var(--danger)30'
}}>
  High Risk
</Badge>

// Neutral
<Badge style={{ 
  backgroundColor: 'var(--accent)',
  color: 'var(--muted-foreground)',
  border: '1px solid var(--border)'
}}>
  Pending
</Badge>
```

### Buttons
```tsx
// Primary Button
<Button 
  className="shadow-sm hover:shadow-md transition-all duration-150 hover:scale-105"
  style={{ 
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    fontSize: 'var(--text-body)',
    fontWeight: 'var(--font-weight-semibold)',
    borderRadius: 'var(--radius-lg)',
    height: '40px'
  }}
>
  Primary Action
</Button>

// Secondary/Outline Button
<Button 
  variant="outline"
  className="hover:bg-accent transition-all duration-150"
  style={{ 
    fontSize: 'var(--text-body)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-lg)'
  }}
>
  Secondary Action
</Button>

// Ghost Button
<Button 
  variant="ghost"
  className="hover:bg-accent transition-colors"
>
  Ghost Action
</Button>
```

### Navigation Items
```tsx
// Active State
<Link
  className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150"
  style={{
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontWeight: 'var(--font-weight-medium)',
    boxShadow: 'var(--shadow-sm)'
  }}
>
  <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
  <span>Dashboard</span>
</Link>

// Inactive State
<Link
  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150"
  style={{
    color: 'var(--muted-foreground)',
    fontWeight: 'var(--font-weight-normal)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--accent)';
    e.currentTarget.style.color = 'var(--accent-foreground)';
  }}
>
  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
  <span>Reports</span>
</Link>
```

### Search Input (with ⌘K hint)
```tsx
<div className="relative">
  <Search 
    className="w-4 h-4 absolute left-3.5 pointer-events-none" 
    style={{ color: 'var(--muted-foreground)' }} 
  />
  <Input 
    placeholder="Search users, roles, apps..." 
    className="pl-10 pr-16 w-full h-10 rounded-lg border-0 shadow-sm transition-all duration-150 focus-visible:shadow-md"
    style={{ 
      backgroundColor: 'var(--input-background)',
      fontSize: 'var(--text-sm)'
    }}
  />
  <kbd 
    className="absolute right-3 pointer-events-none px-1.5 py-0.5 rounded border text-[10px] font-semibold"
    style={{ 
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border)',
      color: 'var(--muted-foreground)'
    }}
  >
    ⌘K
  </kbd>
</div>
```

### Table Rows
```tsx
// Row with hover
<TableRow 
  className="cursor-pointer transition-colors duration-150"
  style={{ borderColor: 'var(--border)' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--accent)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  }}
>
  <TableCell style={{ 
    color: 'var(--text)',
    fontWeight: 'var(--font-weight-medium)'
  }}>
    Data
  </TableCell>
</TableRow>
```

### Chart Containers
```tsx
<Card className="p-6 lg:p-8" style={{ 
  backgroundColor: 'var(--card)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-sm)'
}}>
  {/* Chart Header */}
  <div className="flex items-start justify-between mb-6">
    <div>
      <h3 style={{ 
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text)',
        letterSpacing: '-0.01em'
      }}>
        Chart Title
      </h3>
      <p style={{ 
        fontSize: 'var(--text-sm)',
        color: 'var(--muted-foreground)'
      }}>
        Subtitle
      </p>
    </div>
    <div className="text-right">
      <div style={{ 
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--text)'
      }}>
        161
      </div>
      <div style={{ 
        fontSize: 'var(--text-sm)',
        color: 'var(--success)'
      }}>
        +12.5%
      </div>
    </div>
  </div>
  
  {/* Chart */}
  <ResponsiveContainer width="100%" height={220}>
    {/* Chart component */}
  </ResponsiveContainer>
</Card>
```

### AI Insight Items
```tsx
<div 
  className="group p-4 rounded-xl transition-all duration-150 cursor-pointer"
  style={{ 
    backgroundColor: 'var(--accent)',
    border: '0.5px solid var(--border)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--surface)';
    e.currentTarget.style.transform = 'translateX(4px)';
  }}
>
  <div className="flex items-start gap-3">
    {/* Icon */}
    <div 
      className="w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ 
        backgroundColor: 'var(--danger)15',
        border: '1px solid var(--danger)25'
      }}
    >
      <AlertCircle className="w-[18px] h-[18px]" style={{ color: 'var(--danger)' }} />
    </div>
    
    {/* Content */}
    <div className="flex-1">
      <Badge style={{ 
        backgroundColor: 'var(--danger)15',
        color: 'var(--danger)',
        fontSize: '10px'
      }}>
        CRITICAL
      </Badge>
      <h4 style={{ 
        fontSize: 'var(--text-body)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text)'
      }}>
        Alert Title
      </h4>
      <p style={{ 
        fontSize: 'var(--text-sm)',
        color: 'var(--muted-foreground)'
      }}>
        Description
      </p>
    </div>
  </div>
</div>
```

---

## Layout Patterns

### Page Container
```tsx
<div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
  {/* Content */}
</div>
```

### Page Header
```tsx
<div className="mb-8 lg:mb-10">
  <h1 style={{ 
    fontSize: 'var(--text-3xl)',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--text)',
    letterSpacing: '-0.02em',
    marginBottom: '8px'
  }}>
    Page Title
  </h1>
  <p style={{ 
    fontSize: 'var(--text-md)',
    color: 'var(--text-secondary)',
    lineHeight: 'var(--line-height-normal)'
  }}>
    Page description
  </p>
</div>
```

### Grid Layouts
```tsx
// 4-column KPI grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
  {/* KPI cards */}
</div>

// 2/3 + 1/3 split
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar */}
  </div>
</div>
```

---

## Animation & Transitions

### Standard Timing
```css
transition-all duration-150 ease-out  /* Default */
transition-colors duration-150        /* Color only */
transition-transform duration-150     /* Transform only */
```

### Hover Effects
```tsx
// Elevation + Lift
hover:shadow-md hover:-translate-y-0.5

// Scale
hover:scale-105

// Translate
hover:translate-x-1
```

### Focus States
```tsx
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

---

## Accessibility

### WCAG AA Compliance
- Body text contrast: ≥ 4.5:1
- Large text/icons: ≥ 3:1
- Focus indicators: 2px solid ring
- Keyboard navigation: Tab order maintained

### Screen Reader Support
```tsx
<span className="sr-only">Close</span>
<Button aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>
```

### Reduced Motion
```tsx
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

```
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

### Responsive Patterns
```tsx
// Stack on mobile, grid on desktop
className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6"

// Hide on mobile
className="hidden lg:flex"

// Show on mobile only
className="lg:hidden"

// Responsive padding
className="p-4 lg:p-8"
```