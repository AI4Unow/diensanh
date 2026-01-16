# Phase 1: Typography & Fonts

## Context Links

- [Color & Typography Research](research/researcher-01-color-typography.md)

## Overview

| Priority | Status | Effort |
|----------|--------|--------|
| P0 (Critical) | pending | 45min |

Add Be Vietnam Pro font with proper Vietnamese diacritic support and optimize line-height for readability.

## Key Insights from Research

- Vietnamese has 134 character combinations with stacked diacritics
- Be Vietnam Pro = gold standard for Vietnamese web typography
- Target users: Non-technical commune workers (elderly) - **18px base font**
- `font-display: swap` for immediate text rendering
- Avoid uppercase Vietnamese (destroys diacritic legibility)

## Requirements

### Functional

- Load Be Vietnam Pro from Google Fonts
- Support weights: 400, 500, 600, 700
- Include Vietnamese subset
- Fallback to Inter, system fonts
- **Base font size: 18px** (for elderly users)

### Non-functional

- Font loads without blocking render
- No FOUT (Flash of Unstyled Text) shift
- WCAG AAA compliance (18px text, 1.6 line-height)

## Related Code Files

| Action | File Path |
|--------|-----------|
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/styles/globals.css` |
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/index.html` |

## Implementation Steps

### 1. Add font preload to index.html

Add in `<head>` before other styles:

```html
<!-- Preload Be Vietnam Pro for Vietnamese text -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&subset=vietnamese">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&subset=vietnamese">
```

### 2. Update font-sans token in globals.css

Replace current `--font-sans`:

```css
--font-sans: 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 3. Add line-height token

Add to `@theme` block:

```css
--line-height-base: 1.6;
--line-height-tight: 1.4;
```

### 4. Update body styles

Add text rendering optimization and base font size:

```css
body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: 18px; /* Increased from 16px for elderly users */
  line-height: var(--line-height-base);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Todo List

- [ ] Add font preconnect and preload links to index.html
- [ ] Update --font-sans token with Be Vietnam Pro
- [ ] Add --line-height-base: 1.6 token
- [ ] Update body styles with font-size: 18px and line-height
- [ ] Test Vietnamese text rendering (diacritics: ấ, ờ, ệ)
- [ ] Verify no FOUT on page load

## Success Criteria

- Be Vietnam Pro loads and displays Vietnamese correctly
- Stacked diacritics (ấ, ờ, ệ) render without overlap
- Line height provides comfortable reading for Vietnamese
- Font swap happens without layout shift

## Security Considerations

- Google Fonts CDN is trusted, no CSP changes needed
- No user data involved
