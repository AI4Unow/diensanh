# Phase 3: Update Typography

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)

## Overview
- **Date:** 2026-01-16
- **Priority:** P2
- **Status:** pending
- **Effort:** 45m

Ensure typography matches target website specs. Current setup mostly correct, minor adjustments needed.

## Key Insights

### Current State (globals.css)
- Font: Be Vietnam Pro (correct)
- Base size: 18px (correct for elderly)
- Line height: 1.6 (correct)
- Missing: font weight tokens, letter spacing, text surface colors

### Target Additions
- Font weight tokens: 400, 500, 600, 700
- Letter spacing tokens: tight, normal, wide
- Text color tokens: primary, secondary, disabled

## Requirements

### Functional
- Add font weight CSS variables
- Add letter spacing tokens
- Add text surface color tokens
- Verify text rendering optimizations

### Non-Functional
- Vietnamese diacritics display correctly
- Consistent typography across components
- 1.6 line height maintained for body text

## Architecture

### Typography Token Structure
```
Font Family
└── --font-sans: 'Be Vietnam Pro', ...

Font Sizes (rem-based)
├── --font-size-sm: 0.875rem (14px)
├── --font-size-base: 1rem (18px after html scaling)
├── --font-size-lg: 1.125rem
├── --font-size-xl: 1.25rem
├── --font-size-2xl: 1.5rem
└── --font-size-3xl: 2rem

Font Weights
├── --font-weight-normal: 400
├── --font-weight-medium: 500
├── --font-weight-semibold: 600
└── --font-weight-bold: 700

Line Heights
├── --line-height-tight: 1.4
├── --line-height-base: 1.6
└── --line-height-relaxed: 1.8

Letter Spacing
├── --letter-spacing-tight: -0.01em
├── --letter-spacing-normal: 0
└── --letter-spacing-wide: 0.02em

Text Colors
├── --color-text-primary: oklch(25% 0.08 240)
├── --color-text-secondary: oklch(40% 0.05 240)
└── --color-text-disabled: oklch(60% 0 0)
```

## Related Code Files

### To Modify
- `web/src/styles/globals.css` - add typography tokens

### To Verify
- All components using inline font-weight should use tokens after Phase 5

## Implementation Steps

1. **Add Font Size Tokens**
   ```css
   @theme {
     --font-size-sm: 0.875rem;
     --font-size-base: 1rem;
     --font-size-lg: 1.125rem;
     --font-size-xl: 1.25rem;
     --font-size-2xl: 1.5rem;
     --font-size-3xl: 2rem;
   }
   ```

2. **Add Font Weight Tokens**
   ```css
   @theme {
     --font-weight-normal: 400;
     --font-weight-medium: 500;
     --font-weight-semibold: 600;
     --font-weight-bold: 700;
   }
   ```

3. **Add Line Height Token (relaxed)**
   ```css
   @theme {
     --line-height-relaxed: 1.8;
   }
   ```
   Note: tight (1.4) and base (1.6) already exist

4. **Add Letter Spacing Tokens**
   ```css
   @theme {
     --letter-spacing-tight: -0.01em;
     --letter-spacing-normal: 0;
     --letter-spacing-wide: 0.02em;
   }
   ```

5. **Add Text Color Tokens**
   ```css
   @theme {
     --color-text-primary: oklch(25% 0.08 240);
     --color-text-secondary: oklch(40% 0.05 240);
     --color-text-disabled: oklch(60% 0 0);
   }
   ```

6. **Verify Text Rendering**
   - Confirm body has:
   ```css
   text-rendering: optimizeLegibility;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   ```

7. **Add Google Fonts Import (if missing)**
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&subset=vietnamese');
   ```
   Note: Check if already loaded via index.html

8. **Build and Test**
   ```bash
   cd web && npm run build
   ```

9. **Visual Check**
   - Vietnamese text with diacritics
   - Heading weights
   - Body text line height

## Todo List
- [ ] Add font size tokens
- [ ] Add font weight tokens
- [ ] Add line-height-relaxed
- [ ] Add letter spacing tokens
- [ ] Add text color tokens
- [ ] Verify text rendering styles
- [ ] Check font import source
- [ ] Build and visual test

## Success Criteria
- All typography tokens defined in @theme
- Vietnamese diacritics render with proper spacing
- Consistent 18px base size
- 1.6 line height for body text
- Font weights 400-700 available

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Font loading issues | Low | Medium | Verify import works |
| Diacritic clipping | Low | High | Test with Vietnamese text |
| Token naming conflicts | Low | Low | Use standard naming |

## Security Considerations
None - typography tokens only.

## Next Steps
Proceed to [Phase 4: Create Component Library](./phase-04-create-component-library.md)
