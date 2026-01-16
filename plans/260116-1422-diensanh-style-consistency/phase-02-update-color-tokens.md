# Phase 2: Update Color Tokens

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)

## Overview
- **Date:** 2026-01-16
- **Priority:** P1
- **Status:** pending
- **Effort:** 1h

Update color palette in globals.css to match target website (diensanh.quangtri.gov.vn). Primary change: navy blue #1E3A8A replaces #004A99.

## Key Insights

### Color Mapping (Current → Target)

| Token | Current | Target | Notes |
|-------|---------|--------|-------|
| primary-500 | oklch(55% 0.20 250) | oklch(55% 0.12 240) | #1e40af |
| primary-600 | oklch(45% 0.24 250) | oklch(40% 0.10 240) | #1e3a8a (main) |
| primary-700 | oklch(40% 0.22 250) | oklch(40% 0.10 240) | darker variant |
| gov-gold | oklch(48% 0.19 27) | oklch(85% 0.20 85) | #FFCD00 actual gold |

### Issues to Fix
1. `gov-gold` is actually red (#D42131) - should be gold (#FFCD00)
2. Hue 250 vs 240 difference (current is more purple-ish)
3. `gov-blue` token undefined but used in some components

## Requirements

### Functional
- Update primary color scale to navy blue (#1E3A8A base)
- Fix gov-gold to actual gold color
- Add missing gov-blue token
- Consolidate duplicate tokens (primary-cta = primary-600)

### Non-Functional
- WCAG AAA 7:1 contrast on white backgrounds
- OKLCH color space for perceptual uniformity
- Consistent hue (240) across primary scale

## Architecture

### Token Structure (globals.css @theme)
```
Primary Colors (Navy Blue Scale)
├── primary-50 → primary-900 (9 shades)
├── Hue: 240 (true blue)
└── Base: primary-600 (#1E3A8A)

Government Accent Colors
├── gov-red: #DA251D (flag red)
├── gov-gold: #FFCD00 (actual gold)
├── gov-blue-light: light bg
└── gov-blue-dark: dark hover

Semantic Colors
├── success: green
├── warning: amber
├── error: red
└── info: blue
```

## Related Code Files

### To Modify
- `web/src/styles/globals.css` - primary source of truth

### To Verify (component updates in Phase 5)
- Components using `gov-gold` (focus rings)
- Components using `text-green-600` / `text-red-600`

## Implementation Steps

1. **Backup Current Tokens**
   - Document current values for rollback reference

2. **Update Primary Scale**
   ```css
   --color-primary-50: oklch(97% 0.01 240);
   --color-primary-100: oklch(93% 0.02 240);
   --color-primary-200: oklch(87% 0.04 240);
   --color-primary-300: oklch(75% 0.06 240);
   --color-primary-400: oklch(65% 0.08 240);
   --color-primary-500: oklch(55% 0.12 240);  /* #1e40af */
   --color-primary-600: oklch(40% 0.10 240);  /* #1e3a8a - MAIN */
   --color-primary-700: oklch(35% 0.09 240);
   --color-primary-800: oklch(30% 0.08 240);
   --color-primary-900: oklch(25% 0.08 240);  /* #0f172a */
   ```

3. **Fix Government Accent Colors**
   ```css
   --color-gov-red: oklch(55% 0.18 25);      /* #DA251D */
   --color-gov-gold: oklch(85% 0.20 85);     /* #FFCD00 - ACTUAL GOLD */
   --color-gov-blue: oklch(40% 0.10 240);    /* Alias for primary-600 */
   --color-gov-blue-light: oklch(97% 0.01 240);
   --color-gov-blue-dark: oklch(25% 0.08 240);
   ```

4. **Add Semantic Color Tokens**
   ```css
   --color-success: oklch(60% 0.15 145);
   --color-warning: oklch(65% 0.14 85);
   --color-error: oklch(55% 0.18 25);
   --color-info: oklch(60% 0.12 240);
   ```

5. **Remove Duplicate Token**
   - Remove `--color-primary-cta` (use primary-600 directly)

6. **Update Focus Ring Color**
   - Change :focus-visible to use updated gov-gold (now actual gold)

7. **Run Build and Verify**
   ```bash
   cd web && npm run build
   ```

8. **Contrast Check**
   - Primary-600 on white: should be >7:1
   - Use browser devtools or contrast checker

## Todo List
- [ ] Document current token values
- [ ] Update primary scale (10 shades)
- [ ] Fix gov-gold to actual gold
- [ ] Add gov-blue token
- [ ] Update semantic colors
- [ ] Remove primary-cta duplicate
- [ ] Update focus ring styles
- [ ] Build and verify
- [ ] Check contrast ratios

## Success Criteria
- All primary colors use hue 240
- gov-gold renders as yellow/gold (not red)
- Primary-600 (#1E3A8A) is main brand color
- WCAG AAA contrast verified
- No build errors

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Contrast regression | Medium | High | Check all text/bg combos |
| Focus ring visibility | Low | Medium | Test gold on various bgs |
| Component breakage | Low | Low | Phase 5 handles updates |

## Security Considerations
None - CSS token updates only.

## Next Steps
Proceed to [Phase 3: Update Typography](./phase-03-update-typography.md)
