# Phase 6: Apply Visual Effects

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)
- **Prerequisites:** Phase 2 (colors), Phase 4-5 (components)

## Overview
- **Date:** 2026-01-16
- **Priority:** P3
- **Status:** pending
- **Effort:** 1h

Apply consistent visual effects: shadows, borders, focus states, gradients. Ensure alignment with target website patterns.

## Key Insights

### Shadow System (Target)
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Border Radius System (Target)
```css
--radius-sm: 4px;   /* Small elements */
--radius-md: 8px;   /* Buttons, inputs */
--radius-lg: 12px;  /* Cards */
--radius-xl: 16px;  /* Large containers */
--radius-full: 9999px; /* Pills, avatars */
```

### Focus States (Target)
```css
:focus-visible {
  outline: 2px solid primary-500;
  outline-offset: 2px;
}
```

### Current Issues
1. Current radius-md is 6px (should be 8px)
2. Current radius-lg is 8px (should be 12px)
3. Focus uses box-shadow with gov-gold (needs update for actual gold)
4. No gradient tokens defined

## Requirements

### Functional
- Update border radius scale
- Add shadow tokens
- Standardize focus indicators
- Add gradient utilities (optional, sparingly used)

### Non-Functional
- Subtle shadows (avoid harsh drops)
- 3:1 focus indicator contrast
- Consistent radius across components

## Architecture

### Token Updates (globals.css)
```css
@theme {
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Updated Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px - buttons, inputs */
  --radius-lg: 0.75rem;   /* 12px - cards */
  --radius-xl: 1rem;      /* 16px - containers */
  --radius-full: 9999px;  /* Pills */
}
```

## Related Code Files

### To Modify
- `web/src/styles/globals.css` - tokens and focus styles

### To Verify
- `web/src/components/ui/button.tsx` - uses rounded-lg
- `web/src/components/ui/input.tsx` - uses rounded-lg
- `web/src/components/ui/card.tsx` - uses rounded-xl

## Implementation Steps

### 1. Update Shadow Tokens

Add to globals.css @theme:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### 2. Update Border Radius

Update existing tokens:
```css
--radius-sm: 0.25rem;   /* 4px - was 4px OK */
--radius-md: 0.5rem;    /* 8px - was 6px CHANGE */
--radius-lg: 0.75rem;   /* 12px - was 8px CHANGE */
--radius-xl: 1rem;      /* 16px - was 12px CHANGE */
--radius-full: 9999px;  /* ADD */
```

### 3. Update Focus States

Replace current box-shadow focus with outline:
```css
/* Primary focus style */
:focus-visible {
  outline: 2px solid oklch(55% 0.12 240); /* primary-500 */
  outline-offset: 2px;
}

/* Override for buttons/inputs that need gold ring */
.focus-ring-gold:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px oklch(85% 0.20 85 / 0.3); /* gov-gold 30% */
}
```

### 4. Add Gradient Utilities (Optional)

```css
/* Use sparingly - only for hero sections */
.gradient-primary {
  background: linear-gradient(
    135deg,
    oklch(40% 0.10 240) 0%,
    oklch(55% 0.12 240) 100%
  );
}

.gradient-overlay {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}
```

### 5. Add Transition Utilities

```css
/* Standardize transitions */
.transition-default {
  transition: all 150ms ease-in-out;
}

/* Already using Tailwind's transition-colors - just verify consistency */
```

### 6. Update Card Shadows

Verify card.tsx uses shadow tokens:
```tsx
// card.tsx
variant === 'default' && 'shadow-sm',
// Hover state
'hover:shadow-md transition-shadow'
```

### 7. Add Hover Elevation Pattern

```css
/* Card hover effect */
.card-hover {
  transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out;
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### 8. Verify Border Colors

Ensure all borders use semantic tokens:
```tsx
// Components should use
"border-border"     // Default
"border-primary-600" // Accent
"border-error"      // Error state
```

### 9. Build and Test

```bash
cd web && npm run build && npm run dev
```

Visual checks:
- Card shadows appear subtle
- Focus rings visible on keyboard nav
- Hover states smooth
- Radius consistent

## Todo List
- [ ] Add shadow tokens to @theme
- [ ] Update border radius values
- [ ] Update :focus-visible styles
- [ ] Add focus-ring-gold utility class
- [ ] Add gradient utilities (optional)
- [ ] Verify card hover effects
- [ ] Test keyboard navigation focus
- [ ] Build and visual test

## Success Criteria
- Shadow tokens defined and used
- Border radius matches target (8px buttons, 12px cards)
- Focus indicators 2px outline, 2px offset
- Hover states have subtle elevation
- No hardcoded shadow/radius values

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Focus visibility | Medium | High | Test keyboard nav |
| Radius changes break layouts | Low | Low | Minor visual difference |
| Shadow performance | Low | Low | Use GPU-accelerated props |

## Security Considerations
None - visual effects only.

## Next Steps
Proceed to [Phase 7: Accessibility Validation](./phase-07-accessibility-validation.md)
