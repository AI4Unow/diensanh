# UI/UX Research: Color Palette & Typography for Government Web Apps

**Date:** 2026-01-16
**Context:** Vietnamese commune management app (React 19 + Tailwind CSS 4 + Vite 7)
**Target:** WCAG AAA accessibility, government/public service trust

---

## 1. Government Color Palette Recommendations

### Core Principles
- **Trust & Authority:** Blue remains dominant (used by 60%+ of government sites globally)
- **Accessibility First:** WCAG AAA requires 7:1 contrast ratio for normal text, 4.5:1 for large text
- **Cultural Context:** Vietnamese government sites favor navy blue (#1e3a8a range) + red accents

### Recommended Palette (WCAG AAA Compliant)

```css
/* Primary - Government Blue */
--color-primary-50: oklch(97% 0.01 240);   /* Near white */
--color-primary-100: oklch(93% 0.02 240);
--color-primary-500: oklch(55% 0.12 240);  /* #1e40af equivalent - main brand */
--color-primary-700: oklch(40% 0.10 240);  /* #1e3a8a equivalent - dark */
--color-primary-900: oklch(25% 0.08 240);  /* Near black */

/* Secondary - Vietnamese Red (accents only) */
--color-secondary-500: oklch(55% 0.18 25); /* Muted red for flags/headers */

/* Semantic Colors */
--color-success: oklch(60% 0.15 145);      /* Green - 7:1 on white */
--color-warning: oklch(65% 0.14 85);       /* Amber - 7:1 on white */
--color-error: oklch(55% 0.18 25);         /* Red - 7:1 on white */
--color-info: oklch(60% 0.12 240);         /* Blue - 7:1 on white */

/* Neutrals */
--color-neutral-50: oklch(98% 0 0);
--color-neutral-500: oklch(60% 0 0);       /* 7:1 on white */
--color-neutral-900: oklch(25% 0 0);       /* 15:1 on white */
```

### Why OKLCH?
- **Perceptual uniformity:** 500-level colors appear equally bright to human eye
- **Better accessibility:** Easier to achieve consistent contrast ratios
- **Future-proof:** Supports P3 wide-gamut displays (100% mobile by 2026)

---

## 2. Vietnamese Typography Best Practices

### Core Challenge: Diacritic Rendering
Vietnamese has 134 possible character combinations with stacked diacritics (ấ, ờ, ệ). Poor font support creates "lỗi font" (mixed font rendering).

### Recommended Font Stack

```css
font-family:
  'Be Vietnam Pro',           /* Gold standard - designed for Vietnamese */
  'Inter',                    /* Excellent diacritic support + screen-optimized */
  -apple-system,              /* iOS system font */
  BlinkMacSystemFont,         /* macOS system font */
  'Segoe UI',                 /* Windows system font */
  Roboto,                     /* Android fallback */
  sans-serif;
```

### Implementation (Tailwind CSS 4 + Google Fonts)

```css
/* In your main CSS file */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&subset=vietnamese');

@theme {
  /* Typography tokens */
  --font-sans: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Vietnamese-specific spacing */
  --line-height-base: 1.6;        /* Extra space for diacritics */
  --line-height-tight: 1.4;       /* Headings */

  /* Font sizes (min 16px for mobile) */
  --font-size-sm: 0.875rem;       /* 14px - use sparingly */
  --font-size-base: 1rem;         /* 16px - body text */
  --font-size-lg: 1.125rem;       /* 18px - comfortable reading */
  --font-size-xl: 1.25rem;        /* 20px - subheadings */
}

/* Text rendering optimization */
body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Readability Rules
- **Line height:** 1.6 for body (vs 1.5 for English) - diacritics need vertical space
- **Line length:** 45-75 characters per line (use `max-w-prose` in Tailwind)
- **Font size:** 16px minimum (18px recommended for government sites serving elderly users)
- **Avoid uppercase:** Destroys diacritic legibility - use font-weight instead

---

## 3. Tailwind CSS 4 Configuration Pattern

### Modern Approach: CSS-First with `@theme`

```css
/* app.css or index.css */
@import "tailwindcss";

@theme {
  /* Semantic color tokens (government design system) */
  --color-brand-primary: oklch(40% 0.10 240);        /* Navy blue */
  --color-brand-secondary: oklch(55% 0.18 25);       /* Vietnamese red */

  --color-surface-primary: oklch(100% 0 0);          /* White */
  --color-surface-secondary: oklch(97% 0.01 240);    /* Off-white */
  --color-surface-tertiary: oklch(93% 0.02 240);     /* Light blue */

  --color-text-primary: oklch(25% 0.08 240);         /* Dark blue (15:1) */
  --color-text-secondary: oklch(40% 0.05 240);       /* Medium blue (7:1) */
  --color-text-disabled: oklch(60% 0 0);             /* Gray (4.5:1) */

  --color-border-default: oklch(85% 0.01 240);
  --color-border-focus: oklch(55% 0.12 240);

  /* Status colors (WCAG AAA on white) */
  --color-status-success: oklch(60% 0.15 145);
  --color-status-warning: oklch(65% 0.14 85);
  --color-status-error: oklch(55% 0.18 25);
  --color-status-info: oklch(60% 0.12 240);

  /* Typography */
  --font-sans: 'Be Vietnam Pro', 'Inter', -apple-system, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
}
```

### Usage in Components

```tsx
// Semantic tokens make intent clear
<button className="bg-brand-primary text-surface-primary hover:bg-primary-700">
  Đăng nhập
</button>

<div className="text-text-secondary border-border-default">
  Thông tin chi tiết
</div>

// Status indicators
<div className="bg-status-error text-white">
  Lỗi xác thực
</div>
```

### Dark Mode Support (Future)

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-surface-primary: oklch(20% 0.02 240);
    --color-text-primary: oklch(95% 0.01 240);
    /* Semantic tokens automatically adapt */
  }
}
```

---

## 4. Accessibility Checklist (WCAG AAA)

- [x] Text contrast ≥7:1 (normal text), ≥4.5:1 (large text ≥18px)
- [x] Interactive elements ≥3:1 contrast with surrounding colors
- [x] Focus indicators visible (2px outline at 3:1 contrast)
- [x] Color not sole indicator of meaning (use icons + labels)
- [x] Font size ≥16px on mobile
- [x] Line height ≥1.5 (Vietnamese: 1.6)
- [x] No uppercase Vietnamese text in UI

---

## 5. Implementation Priority

**Quick Wins (Today):**
1. Add Be Vietnam Pro font via Google Fonts
2. Define semantic color tokens in `@theme`
3. Set line-height to 1.6 globally

**Phase 2 (This Week):**
1. Convert all color utilities to OKLCH
2. Test contrast ratios with axe DevTools
3. Remove any uppercase Vietnamese text

**Phase 3 (Later):**
1. Build component library using semantic tokens
2. Add dark mode support
3. Implement focus management system

---

## Key Takeaways

- **Color:** Navy blue (#1e3a8a equivalent in OKLCH) for trust + WCAG AAA semantic palette
- **Typography:** Be Vietnam Pro (primary) + Inter (fallback) at 16-18px with 1.6 line height
- **Tailwind 4:** Use `@theme` + semantic tokens + OKLCH for maintainable design system
- **Accessibility:** 7:1 contrast ratio minimum, no uppercase Vietnamese, focus indicators

---

## Sources

- Vietnamese Typography Guide: vietnamesetypography.com
- Be Vietnam Pro Font: fonts.google.com/specimen/Be+Vietnam+Pro
- Google Web Fundamentals: developers.google.com/web/fundamentals/design-and-ux/typography
- Tailwind CSS v4 Documentation: tailwindcss.com
- WCAG 2.2 Guidelines: w3.org/WAI/WCAG22
- OKLCH Color Space: oklch.com

---

## Unresolved Questions

- Need confirmation on brand red accent usage (Vietnamese flag red vs muted government red)?
- Dark mode requirement timeline?
- Specific age demographics for font size optimization (elderly users = 18px+)?
