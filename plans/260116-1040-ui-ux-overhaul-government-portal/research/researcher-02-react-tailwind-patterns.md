# React + Tailwind CSS 4 Accessible Component Patterns
**Research Report** | 2026-01-16 | Government Portal UI/UX

## Executive Summary
Research on accessible React component patterns using Tailwind CSS 4 for elderly-friendly government portals. Focus: large touch targets (48px+), WCAG AAA compliance, high contrast modes.

---

## 1. Touch Target Standards

### Industry Requirements
- **Material Design**: 48x48dp minimum (aligns with ~10mm finger pad)
- **WCAG 2.2 (AA)**: 24x24px minimum
- **WCAG 2.1 (AAA)**: 44x44px minimum
- **Recommendation**: **48x48px minimum** for elderly users

### Implementation Patterns

#### CSS Padding Strategy
```css
.icon-button {
  width: 24px;   /* Visual size */
  height: 24px;
  padding: 12px; /* Hit area = 48x48px */
  box-sizing: content-box;
}
```

#### Min-Sizing Pattern
```css
button, a, input[type="submit"] {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

#### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      minWidth: { 'touch': '48px' },
      minHeight: { 'touch': '48px' },
      spacing: { 'touch-gap': '8px' }
    }
  }
}
```

---

## 2. High Contrast Mode (WCAG AAA)

### CSS Variables Strategy
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'app-bg': 'rgb(var(--color-bg) / <alpha-value>)',
        'app-text': 'rgb(var(--color-text) / <alpha-value>)',
        'app-accent': 'rgb(var(--color-accent) / <alpha-value>)',
      }
    }
  }
}
```

### Theme Definition
```css
@layer base {
  :root {
    --color-bg: 255 255 255;   /* White */
    --color-text: 31 41 55;    /* Gray-800 */
    --color-accent: 29 78 216; /* Blue-700 */
  }

  .theme-high-contrast {
    --color-bg: 0 0 0;         /* Pure Black */
    --color-text: 255 255 255;  /* Pure White */
    --color-accent: 255 255 0;  /* Bright Yellow */
  }
}
```

### System-Level Integration
```css
/* Auto-detect OS high contrast preference */
@media (prefers-contrast: more) {
  :root {
    --color-bg: 0 0 0;
    --color-text: 255 255 255;
  }
}
```

### Forced Colors Mode (Windows)
```jsx
<div className="text-black forced-colors:text-[CanvasText]">
  {/* Respects OS-level color choices */}
</div>
```

---

## 3. WCAG AAA Requirements

### Contrast Ratios
- **Normal text**: 7:1 minimum
- **Large text** (18pt+ / 14pt bold): 4.5:1 minimum
- **UI components**: 3:1 minimum
- **Focus states**: Highly visible (4px outline recommended)

### Focus Implementation
```jsx
className="focus-visible:outline-4 focus-visible:outline-app-accent focus-visible:outline-offset-2"
```

---

## 4. Recommended Component Libraries

### React Aria (Adobe)
- Unstyled accessible primitives
- WCAG compliant out-of-box
- Full keyboard navigation
- **Best for**: Custom designs

### Radix UI
- Headless UI components
- Accessibility-first architecture
- Easy Tailwind integration
- **Best for**: Design systems

### MUI (Material UI)
- 48px touch targets by default
- Built-in accessibility
- **Best for**: Rapid prototyping

---

## 5. Elderly-Friendly Best Practices

### Spacing
- **Touch target gap**: 8px minimum between interactive elements
- Prevents "fat-finger" errors

### Typography
```css
:root {
  font-size: 18px; /* Base size for elderly users */
}

/* Use rem units for scalability */
.text-body { font-size: 1rem; }
.text-heading { font-size: 1.5rem; }
```

### Avoid Gestures
- No swipe/pinch/long-press requirements
- Simple click/tap only
- Provide visible controls for all actions

---

## 6. Performance Optimization (Low-End Android)

### Code Splitting
```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./Dashboard'));
```

### Tailwind Purging
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Only ship used classes
}
```

### Minimize Re-renders
```jsx
// Use React.memo for heavy components
export default memo(HeavyComponent);
```

---

## 7. Implementation Checklist

- [ ] Configure CSS variables for theme switching
- [ ] Set min-width/height: 48px for all interactive elements
- [ ] Add 8px gaps between touch targets
- [ ] Implement `prefers-contrast` media query
- [ ] Add manual high-contrast toggle (localStorage)
- [ ] Use `rem` units for typography (18px base)
- [ ] Test with Lighthouse/Axe DevTools
- [ ] Verify 7:1 contrast ratios
- [ ] Add visible focus indicators (4px outline)
- [ ] Ensure color is not sole differentiator
- [ ] Lazy load non-critical components
- [ ] Purge unused Tailwind classes

---

## Sources
- [Material Design - Touch Targets](https://m3.material.io/foundations/layout/understanding-layout/spacing)
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [React Aria Documentation](https://react-spectrum.adobe.com/react-aria/)
- [Tailwind Forced Colors](https://tailwindcss.com/docs/hover-focus-and-other-states#forced-colors-mode)
- [WCAG 2.1 AAA Standards](https://www.w3.org/TR/WCAG21/#contrast-enhanced)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker)

---

## Unresolved Questions
- Specific low-end Android device performance benchmarks (search timed out)
- Tailwind CSS 4-specific accessibility features vs v3 (limited 2026 documentation available)
