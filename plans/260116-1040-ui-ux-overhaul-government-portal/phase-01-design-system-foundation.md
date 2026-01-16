# Phase 1: Design System Foundation

## Context Links
- [Plan Overview](./plan.md)
- [Gov Portal UX Standards](./research/researcher-01-gov-portal-ux-standards.md)
- [React + Tailwind Patterns](./research/researcher-02-react-tailwind-patterns.md)

## Overview
- **Priority:** P1 (Critical - blocks all other phases)
- **Status:** pending
- **Effort:** 3h
- **Description:** Establish design tokens, color palette, typography, and spacing for elderly-friendly government portal

## Key Insights
From research:
- Government Blue #004A99 for primary, Red #DA251D and Gold #FFCD00 for accents
- 18px base font already set (good)
- WCAG AAA requires 7:1 contrast for normal text
- Touch targets: 48px minimum, 56px optimal for elderly
- OKLCH color space for better perceptual uniformity (already using)

## Requirements

### Functional
- Update primary color from #1d4ed8 to #004A99 (official government blue)
- Add government accent colors (red, gold) as tokens
- Ensure all color combinations meet 7:1 contrast ratio
- Add high-contrast mode toggle support

### Non-Functional
- No breaking changes to existing components
- Maintain dark mode support
- Colors must render correctly on low-end Android screens

## Architecture

### Color Token Structure
```
--color-gov-blue: #004A99 (primary)
--color-gov-red: #DA251D (accents, official seals)
--color-gov-gold: #FFCD00 (highlights, success)
--color-gov-blue-light: #E6F0FA (backgrounds)
--color-gov-blue-dark: #003366 (hover states)
```

### Spacing/Touch Tokens
```
--spacing-touch: 48px (min touch target)
--spacing-touch-lg: 56px (optimal for elderly)
--spacing-touch-gap: 8px (min gap between targets)
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/styles/globals.css` | Update color tokens, add gov colors, spacing tokens, high-contrast mode |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/assets/images/national-emblem.svg` | Vietnamese national emblem (source externally) |

## Implementation Steps

1. **Update primary color palette in globals.css**
   - Change `--color-primary-*` scale to use #004A99 as base
   - Recalculate 50-900 shades using OKLCH for consistency
   - Update `--color-primary-cta` to match new blue

2. **Add government accent colors**
   ```css
   --color-gov-red: oklch(55% 0.22 27);      /* #DA251D */
   --color-gov-gold: oklch(88% 0.17 95);     /* #FFCD00 */
   --color-gov-blue-light: oklch(96% 0.02 250);
   ```

3. **Add touch target spacing tokens**
   ```css
   --spacing-touch: 48px;
   --spacing-touch-lg: 56px;
   --spacing-touch-gap: 8px;
   ```

4. **Update focus ring for high visibility**
   - Increase from 2px to 4px outline
   - Use high-contrast color (gov-gold on dark, gov-blue on light)

5. **Add high-contrast mode support**
   ```css
   @media (prefers-contrast: more) {
     :root {
       --color-background: #000000;
       --color-foreground: #FFFFFF;
       --color-primary-600: #FFCD00; /* Gold for visibility */
     }
   }
   ```

6. **Update border colors for better visibility**
   - Increase border contrast ratio to 3:1 minimum

7. **Test color combinations with WebAIM contrast checker**

## Todo List

- [ ] Update primary color scale to government blue #004A99
- [ ] Add gov-red, gov-gold, gov-blue-light, gov-blue-dark tokens
- [ ] Add spacing-touch and spacing-touch-gap tokens
- [ ] Update focus-visible styles for 4px outline
- [ ] Add high-contrast media query overrides
- [ ] Add forced-colors mode support for Windows
- [ ] Verify all text/background combos meet 7:1 ratio
- [ ] Test on low-end Android emulator
- [ ] Run build to verify no CSS errors

## Success Criteria
- [ ] Primary color visually matches #004A99
- [ ] All text meets 7:1 contrast ratio (WebAIM test)
- [ ] Touch target tokens available for use
- [ ] High-contrast mode activates on OS preference
- [ ] No CSS compilation errors
- [ ] Existing components render correctly

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Color changes break existing UI | Medium | Visual regression test on key pages |
| OKLCH not supported on old browsers | Low | Already using hex fallbacks |
| Dark mode contrast insufficient | Medium | Test both modes separately |

## Security Considerations
None - CSS-only changes

## Next Steps
- After completion, proceed to [Phase 2: Core Layout Components](./phase-02-core-layout-components.md)
- Layout components will use new color tokens
