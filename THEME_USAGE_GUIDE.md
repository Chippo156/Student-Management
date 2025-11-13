# Theme Usage Guide for Student Pages

## Quick Start

### Import theme utilities
```javascript
import { useTheme, alpha } from '@mui/material/styles';
```

### Use theme in components
```javascript
const MyComponent = () => {
  const theme = useTheme();

  return (
    <div style={{
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`
    }}>
      Content
    </div>
  );
};
```

---

## Theme Palette Reference

### Semantic Colors

#### Primary Color
- **Light Mode:** `#4F46E5` (Indigo)
- **Dark Mode:** `#818CF8` (Light Indigo)
- **Usage:** Main CTA buttons, active states, primary text highlights
- **Access:** `theme.palette.primary.main`

```javascript
// Example: Primary button
<Button style={{ background: theme.palette.primary.main }}>
  Primary Action
</Button>
```

#### Secondary Color
- **Light Mode:** `#06B6D4` (Cyan)
- **Dark Mode:** `#22D3EE` (Light Cyan)
- **Usage:** Secondary buttons, accents, secondary information
- **Access:** `theme.palette.secondary.main`

```javascript
// Example: Secondary stat
<div style={{ color: theme.palette.secondary.main }}>
  Secondary Info
</div>
```

#### Success Color
- **Light Mode:** `#10B981` (Green)
- **Dark Mode:** `#34D399` (Light Green)
- **Usage:** Success states, completed items, positive feedback
- **Access:** `theme.palette.success.main`

```javascript
// Example: Success message
<span style={{ color: theme.palette.success.main }}>
  Completed
</span>
```

#### Warning Color
- **Light Mode:** `#F59E0B` (Amber)
- **Dark Mode:** `#FBBF24` (Light Amber)
- **Usage:** Warning states, pending items, caution messages
- **Access:** `theme.palette.warning.main`

```javascript
// Example: Warning badge
<Badge style={{ background: theme.palette.warning.main }}>
  Pending
</Badge>
```

#### Error Color
- **Light Mode:** `#EF4444` (Red)
- **Dark Mode:** `#F87171` (Light Red)
- **Usage:** Error states, failed items, destructive actions
- **Access:** `theme.palette.error.main`

```javascript
// Example: Error text
<span style={{ color: theme.palette.error.main }}>
  Error Message
</span>
```

### Background Colors

#### Page Background
- **Light Mode:** `#F1F5F9`
- **Dark Mode:** `#0F172A`
- **Usage:** Main page/container background
- **Access:** `theme.palette.background.default`

```javascript
// Example: Page wrapper
<div style={{ background: theme.palette.background.default, minHeight: '100vh' }}>
  {/* Page content */}
</div>
```

#### Paper Background (Cards, Panels)
- **Light Mode:** `#FFFFFF`
- **Dark Mode:** `#1E293B`
- **Usage:** Cards, panels, modals, dropdowns
- **Access:** `theme.palette.background.paper`

```javascript
// Example: Card background
<Card style={{ background: theme.palette.background.paper }}>
  Card Content
</Card>
```

#### Secondary Background
- **Light Mode:** `#F8FAFC`
- **Dark Mode:** `#1A1F2E`
- **Usage:** Secondary sections, striped rows, hover states
- **Access:** `theme.palette.background.secondary`

```javascript
// Example: Table header background
<th style={{ background: theme.palette.background.secondary }}>
  Header
</th>
```

### Text Colors

#### Primary Text
- **Light Mode:** `#1E293B` (Dark Slate)
- **Dark Mode:** `#F1F5F9` (Light Slate)
- **Usage:** Main body text, headings
- **Access:** `theme.palette.text.primary`

```javascript
// Example: Primary text
<p style={{ color: theme.palette.text.primary }}>
  Main content text
</p>
```

#### Secondary Text
- **Light Mode:** `#64748B` (Slate)
- **Dark Mode:** `#94A3B8` (Light Slate)
- **Usage:** Subheadings, descriptions, helper text
- **Access:** `theme.palette.text.secondary`

```javascript
// Example: Secondary text
<span style={{ color: theme.palette.text.secondary }}>
  Helper text or description
</span>
```

#### Disabled Text
- **Light Mode:** `#CBD5E1`
- **Dark Mode:** `#475569`
- **Usage:** Disabled inputs, unavailable options
- **Access:** `theme.palette.text.disabled`

```javascript
// Example: Disabled input
<input
  disabled
  style={{ color: theme.palette.text.disabled }}
/>
```

### Border & Divider Colors

#### Divider/Border
- **Light Mode:** `#E2E8F0`
- **Dark Mode:** `#334155`
- **Usage:** Borders, dividers, separators
- **Access:** `theme.palette.divider`

```javascript
// Example: Border
<div style={{ border: `1px solid ${theme.palette.divider}` }}>
  Bordered content
</div>
```

---

## Using `alpha()` for Transparency

The `alpha()` function creates transparent color variants:

```javascript
import { alpha } from '@mui/material/styles';

// 10% opacity
alpha(theme.palette.primary.main, 0.1)  // e.g., rgba(79, 70, 229, 0.1)

// 5% opacity
alpha(theme.palette.primary.main, 0.05) // e.g., rgba(79, 70, 229, 0.05)

// Custom opacity
alpha(theme.palette.success.main, 0.2)  // 20% opacity
```

### Common Patterns

**Soft background for cards:**
```javascript
<div style={{
  background: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
}}>
  Soft background card
</div>
```

**Hover state:**
```javascript
<div style={{
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.04)
  }
}}>
  Hoverable content
</div>
```

**Shadow-like overlay:**
```javascript
<div style={{
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.12)}`
}}>
  Shadowed content
</div>
```

---

## Styling Ant Design Components

### Table Styling
```javascript
<style>
  {`
    .my-table .ant-table {
      background: ${theme.palette.background.paper} !important;
      color: ${theme.palette.text.primary} !important;
    }
    .my-table .ant-table-thead > tr > th {
      background: ${theme.palette.background.secondary} !important;
      color: ${theme.palette.text.primary} !important;
      border-color: ${theme.palette.divider} !important;
      font-weight: 600;
    }
    .my-table .ant-table-tbody > tr > td {
      border-color: ${theme.palette.divider} !important;
      color: ${theme.palette.text.primary} !important;
    }
    .my-table .ant-table-row:hover > td {
      background: ${alpha(theme.palette.primary.main, 0.04)} !important;
    }
  `}
</style>

<Table className="my-table" columns={columns} dataSource={data} />
```

### Card Styling
```javascript
<Card style={{
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  borderRadius: 12
}}>
  Card content
</Card>
```

### Button Styling
```javascript
<Button style={{
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: 'none'
}}>
  Primary Action
</Button>

<Button style={{
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`
}}>
  Secondary Action
</Button>
```

### Form Input Styling
```javascript
<input style={{
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  padding: 8,
  borderRadius: 4
}}/>

<label style={{ color: theme.palette.text.secondary }}>
  Input Label
</label>
```

---

## Dark Mode Detection

### Check if dark mode
```javascript
const theme = useTheme();
const isDark = theme.palette.mode === 'dark';

if (isDark) {
  // Dark mode specific logic
} else {
  // Light mode specific logic
}
```

### Mode-specific styling
```javascript
<div style={{
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.main, 0.1)
    : theme.palette.primary.light
}}>
  Mode-aware background
</div>
```

---

## Best Practices

### 1. Always use theme variables
❌ **Bad:**
```javascript
<div style={{ color: '#333', background: '#fff' }}>
  Content
</div>
```

✅ **Good:**
```javascript
<div style={{
  color: theme.palette.text.primary,
  background: theme.palette.background.paper
}}>
  Content
</div>
```

### 2. Use semantic colors
❌ **Bad:**
```javascript
// Using primary color for warnings
<span style={{ color: theme.palette.primary.main }}>
  Warning: Update required
</span>
```

✅ **Good:**
```javascript
<span style={{ color: theme.palette.warning.main }}>
  Warning: Update required
</span>
```

### 3. Use alpha for variations
❌ **Bad:**
```javascript
// Creating custom rgba
<div style={{ background: 'rgba(79, 70, 229, 0.08)' }}>
  Soft background
</div>
```

✅ **Good:**
```javascript
<div style={{
  background: alpha(theme.palette.primary.main, 0.08)
}}>
  Soft background
</div>
```

### 4. Extract theme usage into objects
❌ **Bad:**
```javascript
return (
  <div style={{
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`
  }}>
    <div style={{
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`
    }}>
      Nested repetition
    </div>
  </div>
);
```

✅ **Good:**
```javascript
const cardStyle = {
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`
};

return (
  <div style={cardStyle}>
    <div style={cardStyle}>
      Reusable style
    </div>
  </div>
);
```

### 5. Scope CSS classes for Ant Design
❌ **Bad:**
```javascript
<style>
  {`
    .ant-table { /* Affects all tables globally */ }
    .ant-btn { /* Affects all buttons globally */ }
  `}
</style>
```

✅ **Good:**
```javascript
<style>
  {`
    .my-component .ant-table { /* Scoped to component */ }
    .my-component .ant-btn { /* Scoped to component */ }
  `}
</style>

<div className="my-component">
  {/* Component content */}
</div>
```

---

## Common Use Cases

### 1. Gradient backgrounds
```javascript
<div style={{
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText
}}>
  Gradient content
</div>
```

### 2. Status indicators
```javascript
const getStatusColor = (status) => {
  switch(status) {
    case 'success': return theme.palette.success.main;
    case 'warning': return theme.palette.warning.main;
    case 'error': return theme.palette.error.main;
    default: return theme.palette.text.secondary;
  }
};

<span style={{ color: getStatusColor(status) }}>
  {status}
</span>
```

### 3. Hover states
```javascript
const [hovered, setHovered] = useState(false);

<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    background: hovered
      ? alpha(theme.palette.primary.main, 0.08)
      : theme.palette.background.paper,
    transition: 'all 0.2s ease'
  }}
>
  Hoverable content
</div>
```

### 4. Theme-aware icons
```javascript
<Icon style={{
  color: theme.palette.primary.main,
  fontSize: 24
}} />
```

---

## Troubleshooting

### Colors not changing in dark mode?
1. Make sure you're importing from `@mui/material/styles`
2. Check that `theme` is properly initialized in `useTheme()`
3. Verify that `!important` is used in CSS-in-JS if needed
4. Clear browser cache if using dev mode

### CSS specificity issues?
Use `!important` for Ant Design component overrides:
```css
.my-component .ant-btn {
  color: ${theme.palette.text.primary} !important;
}
```

### Theme not updating when mode changes?
Ensure parent component re-renders when theme changes:
```javascript
const MyComponent = () => {
  const theme = useTheme(); // This should trigger re-render

  return (
    <div style={{ color: theme.palette.text.primary }}>
      Content updates with theme changes
    </div>
  );
};
```

---

## Additional Resources

- Material-UI Theme Documentation: https://mui.com/material-ui/customization/theming/
- Ant Design Theming: https://ant.design/docs/react/customize-theme
- Theme file: `src/theme.js`
- Refactoring summary: `STUDENT_PAGES_REFACTORING_SUMMARY.md`

---

**Last Updated:** 2025-11-13
**Version:** 1.0
**Status:** Production-ready
