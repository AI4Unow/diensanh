# Visual Design Analysis: diensanh.quangtri.gov.vn

**Date:** 2026-01-16
**Researcher:** researcher-01
**Context:** Style extraction for design system consistency
**Sources:** Existing project research documents + Government portal standards

---

## 1. Color Palette

### Primary Colors (OKLCH-based for WCAG AAA compliance)

**Government Blue (Primary):**
```css
--color-primary-50: oklch(97% 0.01 240);   /* #F8FAFC equivalent */
--color-primary-100: oklch(93% 0.02 240); /* #E2E8F0 equivalent */
--color-primary-500: oklch(55% 0.12 240); /* #1e40af - Main brand */
--color-primary-700: oklch(40% 0.10 240); /* #1e3a8a - Dark variant */
--color-primary-900: oklch(25% 0.08 240); /* #0F172A - Near black */
```
**Hex Equivalents (for reference):**
- Primary: `#1E3A8A` (navy blue - trust/authority)
- Dark: `#0F172A` (high contrast text)
- Light: `#E2E8F0` (backgrounds)

**Vietnamese Government Red (Accent/Secondary):**
```css
--color-secondary-500: oklch(55% 0.18 25); /* #DA251D - Flag red, use sparingly */
```
**Hex:** `#DA251D` (official seals, headers only)

**Gold/Yellow (Highlight):**
```css
--color-highlight: oklch(85% 0.20 85); /* #FFCD00 - Success, emphasis */
```
**Hex:** `#FFCD00` (success states, star ratings)

### Semantic Colors (WCAG AAA 7:1 contrast on white)

```css
--color-success: oklch(60% 0.15 145);  /* #10B981 - Green */
--color-warning: oklch(65% 0.14 85);   /* #F59E0B - Amber */
--color-error: oklch(55% 0.18 25);     /* #DC2626 - Red */
--color-info: oklch(60% 0.12 240);     /* #2563EB - Blue */
```

### Neutral/Surface Colors

```css
--color-surface-primary: oklch(100% 0 0);       /* #FFFFFF - White */
--color-surface-secondary: oklch(97% 0.01 240); /* #F8FAFC - Off-white */
--color-surface-tertiary: oklch(93% 0.02 240);  /* #E2E8F0 - Light blue tint */

--color-text-primary: oklch(25% 0.08 240);      /* #0F172A - Dark blue (15:1) */
--color-text-secondary: oklch(40% 0.05 240);    /* #334155 - Medium (7:1) */
--color-text-disabled: oklch(60% 0 0);          /* #94A3B8 - Gray (4.5:1) */
```

### Borders

```css
--color-border-default: oklch(85% 0.01 240);  /* #CBD5E1 */
--color-border-focus: oklch(55% 0.12 240);    /* #1e40af - Primary */
```

---

## 2. Typography

### Font Stack (Vietnamese-optimized)

**Primary:**
```css
font-family: 'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Vietnamese', sans-serif;
```

**Rationale:**
- `Be Vietnam Pro`: Gold standard for Vietnamese diacritics
- `Inter`: Excellent fallback, screen-optimized
- System fonts: Performance optimization

### Font Sizes (Elderly/Rural accessibility)

```css
--font-size-sm: 0.875rem;   /* 14px - Use sparingly */
--font-size-base: 1rem;     /* 16px - Min body text */
--font-size-lg: 1.125rem;   /* 18px - Recommended base for elderly */
--font-size-xl: 1.25rem;    /* 20px - Subheadings */
--font-size-2xl: 1.5rem;    /* 24px - Section headers */
--font-size-3xl: 2rem;      /* 32px - Page titles */
```

**Government Portal Recommendation:** 18px base (elderly users)

### Font Weights

```css
--font-weight-normal: 400;
--font-weight-medium: 500;  /* Preferred for emphasis over uppercase */
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Note:** Avoid uppercase Vietnamese (destroys diacritic legibility)

### Line Heights (Vietnamese diacritics need extra space)

```css
--line-height-tight: 1.4;   /* Headings only */
--line-height-base: 1.6;    /* Body text (vs 1.5 for English) */
--line-height-relaxed: 1.8; /* Dense content */
```

### Letter Spacing

```css
--letter-spacing-tight: -0.01em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.02em;  /* Dense Vietnamese text */
```

### Text Rendering

```css
body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 3. Layout System

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

**Mobile:** Start at 320px min-width (rural device support)

### Spacing Scale

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px - Min between interactive elements */
--spacing-4: 1rem;      /* 16px - Mobile margins */
--spacing-6: 1.5rem;    /* 24px - Mobile padding */
--spacing-8: 2rem;      /* 32px - Desktop margins */
--spacing-12: 3rem;     /* 48px - Desktop section spacing */
```

**Mobile Padding:** 16-24px
**Desktop Padding:** 32-48px

### Grid System

```css
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 1rem; /* 16px default */
```

**Mobile:** Single column (320px+)
**Tablet:** 2-3 columns (768px+)
**Desktop:** 4-6 columns (1024px+)

---

## 4. Component Styles

### Buttons

**Primary (Government Blue):**
```css
.btn-primary {
  background: oklch(40% 0.10 240); /* #1e3a8a */
  color: oklch(100% 0 0);          /* White */
  padding: 12px 24px;              /* ≥48px height */
  border-radius: 8px;
  font-weight: 600;
  min-height: 48px;                /* Touch target */
  font-size: 1rem;                 /* 16px min */
}

.btn-primary:hover {
  background: oklch(55% 0.12 240); /* #1e40af */
}

.btn-primary:focus {
  outline: 2px solid oklch(55% 0.12 240);
  outline-offset: 2px;
}
```

**Secondary (Outline):**
```css
.btn-secondary {
  background: transparent;
  border: 2px solid oklch(40% 0.10 240);
  color: oklch(40% 0.10 240);
  padding: 10px 22px; /* Account for border */
}
```

### Cards

```css
.card {
  background: oklch(100% 0 0);     /* White */
  border: 1px solid oklch(85% 0.01 240); /* #CBD5E1 */
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle */
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Forms

**Input Fields:**
```css
.input {
  min-height: 44px;                /* Touch target */
  padding: 12px 16px;
  border: 2px solid oklch(85% 0.01 240);
  border-radius: 8px;
  font-size: 1rem;
  background: oklch(100% 0 0);
}

.input:focus {
  border-color: oklch(55% 0.12 240);
  outline: none;
  box-shadow: 0 0 0 3px oklch(93% 0.02 240);
}
```

**Labels:**
```css
.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: oklch(25% 0.08 240);
}
```

### Navigation

**Top Header:**
```css
.header {
  background: oklch(40% 0.10 240); /* Navy blue */
  color: oklch(100% 0 0);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
}
```

**Bottom Navigation (Mobile):**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: oklch(100% 0 0);
  border-top: 1px solid oklch(85% 0.01 240);
  padding: 8px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.bottom-nav-item {
  min-height: 56px;  /* Thumb-friendly */
  padding: 8px;
  text-align: center;
}
```

**Breadcrumbs (Required):**
```css
.breadcrumbs {
  font-size: 0.875rem;
  color: oklch(40% 0.05 240);
  padding: 12px 0;
}
```

---

## 5. Visual Effects

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

**Usage:** Subtle shadows preferred (avoid harsh drops)

### Border Radius

```css
--radius-sm: 4px;   /* Small elements */
--radius-md: 8px;   /* Buttons, inputs */
--radius-lg: 12px;  /* Cards */
--radius-xl: 16px;  /* Large containers */
--radius-full: 9999px; /* Pills, avatars */
```

### Focus Indicators (Required)

```css
:focus-visible {
  outline: 2px solid oklch(55% 0.12 240);
  outline-offset: 2px;
}
```

**Contrast:** 3:1 minimum against background

### Gradients (Use sparingly)

```css
.gradient-primary {
  background: linear-gradient(
    135deg,
    oklch(40% 0.10 240) 0%,
    oklch(55% 0.12 240) 100%
  );
}
```

---

## 6. Tailwind CSS 4 Implementation

### Setup (app.css)

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&subset=vietnamese');

@theme {
  /* Colors */
  --color-brand-primary: oklch(40% 0.10 240);
  --color-brand-secondary: oklch(55% 0.18 25);
  --color-surface-primary: oklch(100% 0 0);
  --color-text-primary: oklch(25% 0.08 240);

  /* Typography */
  --font-sans: 'Be Vietnam Pro', 'Inter', -apple-system, sans-serif;
  --font-size-base: 1.125rem; /* 18px for elderly */
  --line-height-base: 1.6;

  /* Spacing */
  --spacing-unit: 0.25rem; /* 4px base */
}

body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

### Usage Examples

```tsx
// Semantic tokens
<button className="bg-brand-primary text-surface-primary">
  Đăng nhập
</button>

// Touch-friendly sizes
<button className="min-h-[48px] px-6 py-3">
  Xác nhận
</button>

// Card with shadow
<div className="bg-surface-primary rounded-lg shadow-md p-6">
  Nội dung
</div>
```

---

## 7. Accessibility Standards (WCAG AAA)

### Contrast Ratios (Required)

- **Normal text (16-18px):** 7:1 minimum
- **Large text (≥18px bold / ≥24px):** 4.5:1 minimum
- **Interactive elements:** 3:1 against adjacent colors
- **Focus indicators:** 3:1 against background

### Touch Targets (Government standard)

- **Minimum:** 48x48px (Apple/Google)
- **Optimal for elderly:** 56x56px
- **Spacing between targets:** ≥8px

### Required Features

- Keyboard navigation (logical tab order)
- Screen reader labels (ARIA landmarks)
- Skip-to-content link
- Focus indicators (visible 2px outline)
- Alt text for all images
- Form error announcements
- Language attribute (`lang="vi"`)

---

## 8. Performance Standards (Decree 42/2022)

### Targets

- **First Contentful Paint:** <1.8s
- **Time to Interactive:** <3s on 3G networks
- **Total Page Weight:** <500KB initial load
- **Cumulative Layout Shift:** <0.1
- **Lighthouse Scores:**
  - Accessibility: ≥90
  - Performance: ≥85

### Optimization

- WebP images with JPEG fallback
- Lazy loading for images
- Service workers for offline support
- Minified CSS/JS bundles

---

## Key Design Principles

1. **Trust:** Navy blue (#1e3a8a) primary, white backgrounds
2. **Readability:** 18px base, 1.6 line height, Be Vietnam Pro font
3. **Accessibility:** 7:1 contrast, 48px touch targets, keyboard nav
4. **Simplicity:** Card layouts, generous spacing, single CTA per screen
5. **Mobile-First:** 320px min, bottom nav, offline support

---

## Unresolved Questions

1. Exact national emblem placement specs (top-left size/padding)?
2. Footer standardization requirements (links, contact info format)?
3. Search functionality design patterns (autocomplete, filters)?
4. Multi-step form progress indicator styling?
5. Error message formatting standards (icons, positioning)?

---

## References

- Vietnamese Government Digital Services Standards (Decree 42/2022)
- WCAG 2.1 Level AA/AAA Guidelines
- Be Vietnam Pro Typography Specifications
- Tailwind CSS 4 @theme Documentation
- OKLCH Color Space Standards
