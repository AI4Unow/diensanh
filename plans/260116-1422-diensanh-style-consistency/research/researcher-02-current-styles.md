# Current Styling Analysis - Diensanh Web App

**Date:** 2026-01-16
**Researcher:** researcher-02
**Focus:** Current styling setup, Tailwind config, component patterns

---

## Executive Summary

Web app uses **Tailwind CSS v4** with custom Vietnamese government design tokens. Mix of utility-first Tailwind + custom CSS variables. NO traditional `tailwind.config.js` - uses new `@theme` directive in CSS.

**Key Findings:**
- Tailwind v4 (new CSS-based config via `@theme`)
- Vietnamese govt blue (#004A99) as primary
- Accessibility-first (elderly users, touch targets, high contrast)
- Legacy Vite template CSS conflicts with Tailwind styles
- Inconsistent color token usage (primary vs gov-* colors)

---

## 1. Styling Architecture

### Stack
- **Tailwind CSS:** v4.1.18 (@tailwindcss/vite plugin)
- **Utilities:** clsx + tailwind-merge (cn helper)
- **Method:** Utility-first with custom design tokens

### File Structure
```
web/
├── src/
│   ├── index.css           # Legacy Vite template (conflicts)
│   ├── App.css             # Legacy Vite template (conflicts)
│   ├── styles/
│   │   └── globals.css     # MAIN - Tailwind v4 @theme + base styles
│   └── lib/
│       └── utils.ts        # cn() helper (clsx + twMerge)
```

### Build Config
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
plugins: [react(), tailwindcss()]
```

---

## 2. Design Tokens (globals.css)

### Primary Colors - Vietnamese Government Blue
```css
@theme {
  --color-primary-600: oklch(45% 0.24 250);  /* #004A99 - Official */
  --color-primary-500: oklch(55% 0.20 250);
  --color-primary-700: oklch(40% 0.22 250);
  /* ... 50-900 scale */
}
```

### Government Accent Colors
```css
--color-gov-red: oklch(55% 0.22 27);        /* #DA251D - Official red */
--color-gov-gold: oklch(48% 0.19 27);       /* #D42131 - Quoc huy red/gold */
--color-gov-blue-light: oklch(96% 0.02 250); /* Light backgrounds */
--color-gov-blue-dark: oklch(30% 0.20 250);  /* #003366 - Dark hover */
```

### Accessibility Tokens
```css
/* Touch targets for elderly users */
--spacing-touch: 48px;       /* Minimum */
--spacing-touch-lg: 56px;    /* Optimal for elderly */
--spacing-touch-gap: 8px;    /* Gap between targets */

/* Line height for Vietnamese text */
--line-height-base: 1.6;
--line-height-tight: 1.4;
```

### Semantic Colors
```css
--color-background: #ffffff;
--color-foreground: #0f172a;
--color-muted: oklch(0.87 0 0);
--color-muted-foreground: #64748b;
--color-border: #e2e8f0;
--color-card: #ffffff;
```

### Status Colors (WCAG AAA)
```css
--color-success: oklch(65% 0.18 150);
--color-warning: oklch(75% 0.15 85);
--color-error: oklch(60% 0.2 25);
--color-info: oklch(65% 0.18 250);
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
```

### Typography
```css
--font-sans: 'Be Vietnam Pro', 'Inter', system-ui, sans-serif;
html { font-size: 18px; }  /* Base for elderly readability */
```

---

## 3. Global Base Styles

### Accessibility Features
```css
/* Min touch targets */
button, input, select, textarea, [role="button"] {
  min-height: 48px;
  min-width: 48px;
}

/* Enhanced focus (gold ring) */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--color-gov-gold),
              0 0 0 6px var(--color-background);
}

/* High contrast mode */
@media (prefers-contrast: more) {
  --color-primary-600: var(--color-gov-gold);  /* Gold for visibility */
}

/* Forced colors (Windows High Contrast) */
@media (forced-colors: active) {
  * { forced-color-adjust: auto; }
  :focus-visible { outline: 2px solid Highlight; }
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #0f172a;
    --color-foreground: #f8fafc;
    --color-card: #1e293b;
    /* ... */
  }
}
```

### Custom Scrollbar
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-muted); }
::-webkit-scrollbar-thumb {
  background: var(--color-muted-foreground);
  border-radius: var(--radius-md);
}
```

---

## 4. Component Styling Patterns

### Usage Distribution
- 253 className usages across 24 components
- All components use `cn()` helper for conditional styles

### Color Token Usage

**Primary Colors (15 instances):**
```tsx
// Buttons
"bg-primary-600 hover:bg-primary-700"
"text-primary-600"
"border-primary-500"

// Text hierarchy
"text-primary-100"  // Light text on dark bg
"text-primary-200"  // Secondary text
```

**Government Colors (9 instances):**
```tsx
// Accent elements
"border-gov-red"         // Header/footer accent bar
"bg-gov-red hover:bg-gov-red/90"  // Hotline button
"bg-gov-blue-light"      // Icon backgrounds
"text-gov-gold"          // Focus rings, hover accents
```

### Common Patterns

**Cards:**
```tsx
cn(
  'bg-card rounded-xl border-l-4 border-l-primary-600',
  'p-6 shadow-sm min-h-[120px]',
  'hover:shadow-md hover:border-l-primary-700'
)
```

**Buttons:**
```tsx
cn(
  'bg-primary-600 text-white',
  'hover:bg-primary-700 transition-colors cursor-pointer',
  'px-6 py-4 rounded-lg font-semibold',
  'min-h-[56px]'  // Touch target
)
style={{ minHeight: 'var(--spacing-touch-lg)' }}
```

**Inputs:**
```tsx
cn(
  'px-5 py-4 rounded-lg border bg-background',
  'focus:ring-4 focus:ring-gov-gold',
  'min-h-[56px]'
)
```

---

## 5. Issues & Conflicts

### Legacy CSS Files
**Problem:** Vite template defaults conflict with design system

`index.css` (69 lines):
- Dark theme defaults (#242424 bg)
- Generic button styles
- Blue accent colors (#646cff)

`App.css` (42 lines):
- Logo animations
- Max-width containers
- Generic card styles

**Impact:** These are NOT imported/used by components, but pollute workspace.

### Color Token Inconsistencies

**Issue 1: Naming confusion**
- `primary-600` = government blue
- `gov-blue` = different color/undefined in some contexts
- `gov-blue-light` = light backgrounds

**Issue 2: Dual token usage**
```tsx
// StatsCard mixes tokens
border-l-gov-blue      // Skeleton
border-l-primary-600   // Actual card
bg-gov-blue-light      // Icon bg
text-primary-600       // Icon text
```

**Issue 3: Hardcoded colors**
```tsx
// Should use tokens
text-green-600  // vs --color-success
text-red-600    // vs --color-error
```

### Missing Patterns

**No component library:**
- No Button component (inline styles everywhere)
- No Input component
- No Card component base

**No spacing utilities:**
- `--spacing-touch` defined but rarely used
- Mix of inline `minHeight` + Tailwind classes

---

## 6. Strengths

### Excellent Accessibility
- WCAG AAA color contrast
- Touch targets optimized for elderly
- High contrast mode support
- Forced colors support
- Focus-visible gold rings

### Vietnamese Localization
- Be Vietnam Pro font
- Line height optimized for Vietnamese
- 18px base font for readability

### Modern Tailwind v4
- CSS-based config (no JS config)
- OKLCH color space (perceptually uniform)
- Vite plugin integration

### Utility Helper
```typescript
// lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
Prevents class conflicts, enables conditional styles.

---

## 7. Component Examples

### government-header.tsx
```tsx
// Uses semantic classes
"bg-white border-b-4 border-gov-red shadow-sm"
"text-primary-600"
"hover:text-primary-600"
style={{ minHeight: 'var(--spacing-touch)' }}
```

### stats-card.tsx
```tsx
// Inconsistent token usage
"border-l-primary-600"       // Main
"bg-gov-blue-light"          // Icon bg
"text-green-600"             // Trend (should be --color-success)
```

### login-form.tsx
```tsx
// Good touch target usage
className="bg-primary-600 hover:bg-primary-700"
style={{ minHeight: 'var(--spacing-touch-lg)' }}

// Good focus styles
focus:ring-4 focus:ring-gov-gold
```

---

## 8. Recommendations

### Immediate Fixes
1. **Remove legacy CSS:** Delete `index.css` + `App.css`
2. **Standardize colors:** Use `--color-success/error` instead of `green-600/red-600`
3. **Clarify gov-blue:** Rename or consolidate `gov-blue` vs `primary-*` usage

### Component Library
Extract reusable components:
- `<Button variant="primary" size="lg" />`
- `<Input error={} />`
- `<Card variant="stats" />`

### Token Utilities
Add Tailwind utilities for custom tokens:
```css
.min-h-touch { min-height: var(--spacing-touch); }
.min-h-touch-lg { min-height: var(--spacing-touch-lg); }
```

### Documentation
Create style guide mapping:
- When to use `primary-*` vs `gov-*`
- Component examples
- Accessibility checklist

---

## Unresolved Questions

1. **gov-gold color:** Currently set to red (#D42131) - is this correct or should it be actual gold?
2. **gov-blue vs primary:** Are these meant to be the same? Consolidate?
3. **Legacy CSS removal:** Safe to delete index.css + App.css? (Not imported in components)
4. **Component library:** Should we extract base components or continue inline patterns?
5. **Spacing tokens:** Why are `--spacing-touch-*` defined but inconsistently used?
