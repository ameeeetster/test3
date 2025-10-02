# IAM Dashboard - Quick Start Guide

## 🚀 What's New (v2.0 Enterprise)

### Immediate Visual Improvements
1. **Alert Bar**: Critical SoD conflicts shown prominently at top
2. **Quick Actions**: Three buttons under hero for common tasks
3. **KPI Sparklines**: Mini trend charts in stat cards
4. **AI Insights**: Grouped by severity (Critical/Recommendations/Tips)
5. **⌘K Search**: Keyboard shortcut with visible badge

---

## 📐 Design System at a Glance

### Spacing (8px Grid)
```
Small:  4px  (gap between badges)
Medium: 16px (intra-card spacing)
Large:  24px (outer gutters)
Section: 32px (between major sections)
```

### Border Radius (Reduced for Enterprise)
```
Badge:  6px  (rounded-md)
Button: 8px  (rounded-md)
Card:   10px (rounded-lg)
Modal:  12px (rounded-xl)
```

### Typography
```
Hero:    32px semibold tracking-tight
Heading: 18px semibold tracking-tight
Body:    14px normal
Caption: 11-12px medium
```

### Colors (Semantic)
```
Primary:  #4F46E5 (Indigo-600)
Success:  #10B981 (Emerald-500)
Warning:  #F59E0B (Amber-500)
Danger:   #EF4444 (Red-500)
```

---

## 🎨 Component Usage

### AlertBar
```tsx
import { AlertBar } from '../components/AlertBar';

<AlertBar
  variant="danger"
  title="3 SoD conflicts detected"
  description="Critical policy violations in Finance module"
  action={{ label: 'Review', onClick: handleReview }}
  onDismiss={() => setShow(false)}
/>
```

### StatCard with Sparkline
```tsx
import { StatCard } from '../components/StatCard';

<StatCard
  title="Pending Approvals"
  value={24}
  change="+3 today"
  changeType="neutral"
  trend="up"
  icon={CheckSquare}
  iconColor="var(--primary)"
  sparklineData={[18, 22, 19, 24, 20, 26, 24]}
/>
```

### AIPanel (Auto-grouped)
```tsx
import { AIPanel } from '../components/AIPanel';

const suggestions = [
  {
    type: 'alert',
    title: 'High-risk SoD detected',
    description: '3 users have conflicting roles',
    action: 'Review conflicts'
  },
  {
    type: 'recommendation',
    title: 'Optimize workflow',
    description: 'Finance approvals are slower',
    action: 'View details'
  }
];

<AIPanel suggestions={suggestions} />
```

---

## 🎯 Layout Patterns

### Page Structure
```tsx
<div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
  {/* Alert Bar */}
  <AlertBar ... />
  
  {/* Hero */}
  <div className="mb-8">
    <h1 className="tracking-tight" style={{ fontSize: '32px' }}>Title</h1>
    <p>Subtitle</p>
  </div>
  
  {/* Quick Actions */}
  <div className="flex gap-3 mb-8">
    <Button>Primary Action</Button>
    <Button variant="outline">Secondary</Button>
  </div>
  
  {/* KPI Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <StatCard ... />
  </div>
  
  {/* Charts + AI */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">Charts</div>
    <div className="lg:col-span-1"><AIPanel /></div>
  </div>
</div>
```

### Card Template
```tsx
<Card 
  className="p-5 transition-all duration-150"
  style={{ 
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)'
  }}
>
  <h3 className="tracking-tight mb-5" style={{ fontSize: '18px' }}>
    Card Title
  </h3>
  {/* Content */}
</Card>
```

---

## 🔧 Common Customizations

### Delta Chip Colors
```tsx
// Success (green)
style={{ 
  backgroundColor: 'rgb(236 253 245)',
  color: 'rgb(21 128 61)',
  fontSize: '11px',
  fontWeight: 'var(--font-weight-semibold)'
}}

// Danger (red)
style={{ 
  backgroundColor: 'rgb(254 242 242)',
  color: 'var(--danger)',
  // ...
}}

// Neutral (gray)
style={{ 
  backgroundColor: 'rgb(241 245 249)',
  color: 'var(--muted-foreground)',
  // ...
}}
```

### Risk Badge with Icon
```tsx
<Badge 
  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5"
  style={{ 
    backgroundColor: 'rgb(254 242 242)',
    color: 'var(--danger)',
    border: '1px solid rgb(254 226 226)',
    fontSize: '11px'
  }}
>
  <AlertTriangle className="w-3 h-3" />
  High
</Badge>
```

---

## ⌨️ Keyboard Shortcuts

### Implemented
- **⌘K / Ctrl+K**: Focus search input
  ```tsx
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  ```

### Future Enhancements
- **⌘J**: Jump to...
- **⌘P**: Command palette
- **Esc**: Close modals

---

## 🎭 Hover & Focus States

### Card Hover
```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
  e.currentTarget.style.transform = 'translateY(-1px)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
  e.currentTarget.style.transform = 'translateY(0)';
}}
```

### Button Focus
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

---

## 🌗 Dark Mode Support

All components automatically support dark mode via CSS variables:

```tsx
// Light mode
--bg: #FFFFFF
--text: #0F172A

// Dark mode (.dark class)
--bg: #0A0E1A
--text: #F1F5F9
```

Test dark mode:
```tsx
<html className="dark">
```

---

## 📱 Responsive Breakpoints

```css
sm:  640px  /* Mobile landscape */
md:  768px  /* Tablet */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */
```

Example:
```tsx
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

---

## ✅ Accessibility Checklist

- [x] Color contrast ≥ 4.5:1 for body text
- [x] Focus indicators on all interactive elements
- [x] Keyboard navigation support
- [x] ARIA labels for icon-only buttons
- [x] Status conveyed via icon + color (not color alone)
- [x] Reduced motion support (prefers-reduced-motion)

---

## 🐛 Common Issues & Fixes

### Issue: Sparkline not showing
**Fix**: Ensure `sparklineData` is array of numbers (not objects)
```tsx
// ✅ Correct
sparklineData={[18, 22, 19, 24]}

// ❌ Wrong
sparklineData={[{value: 18}, {value: 22}]}
```

### Issue: Card borders too heavy
**Fix**: Use `1px solid` not `2px`
```tsx
border: '1px solid var(--border)'
```

### Issue: Typography too large
**Fix**: Use refined scale (18px not 22px for headings)
```tsx
fontSize: '18px' // headings
fontSize: '14px' // body
fontSize: '11px' // captions
```

---

## 📚 Further Reading

- `/DESIGN_AUDIT.md` - Before/after analysis
- `/TAILWIND_REFERENCE.md` - Complete class reference
- `/IMPLEMENTATION_SUMMARY.md` - Technical details
- `/guidelines/Guidelines.md` - Original spec

---

**Need Help?** Check the Tailwind Reference or Design Audit docs first.  
**Quick Test:** Run `npm run dev` and press ⌘K to test keyboard shortcut.