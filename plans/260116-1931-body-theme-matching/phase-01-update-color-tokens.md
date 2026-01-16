# Phase 01: Update Color Tokens

## Context Links
- [Plan Overview](./plan.md)
- [Gov Design Standards Research](./research/researcher-01-gov-design-standards.md)
- [Banner Color Analysis](./research/researcher-02-banner-color-analysis.md)

## Overview
- **Priority**: P1
- **Status**: pending
- **Effort**: 45 minutes
- **Description**: Add new color tokens for gov-standard body backgrounds and banner-matched accents

## Key Insights
- Gov portals use #F5F5F5 (light gray) body, #FFFFFF (white) cards
- Banner navy: #1A237E (suitable for heading accents - validated choice)
- Need subtle transition between header and body (border/shadow)

## Requirements

### Functional
- Add body background token (`--color-body-bg: #F5F5F5`)
- Add section background variants (light gray shades)
- Add banner navy token for heading accents (#1A237E - validated)

### Non-functional
- OKLCH color space for perceptual uniformity
- WCAG AAA compliance (4.5:1 contrast minimum)

## Related Code Files

### Modify
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/styles/globals.css`

## Implementation Steps

### Step 1: Add Body/Section Background Tokens
After line 58 (after `--color-gov-blue-dark`), add:

```css
/* Body and section backgrounds - Gov standard */
--color-body-bg: oklch(97% 0 0); /* #F5F5F5 - light gray */
--color-section-light: oklch(99% 0 0); /* #FAFAFA */
--color-section-border: oklch(90% 0 0); /* #E0E0E0 */
```

### Step 2: Add Banner-Matched Accent Tokens
After `--color-gov-gold`, add:

```css
--color-banner-red: oklch(55% 0.20 25); /* #D32F2F - main title accent */
--color-banner-navy: oklch(25% 0.12 260); /* #1A237E - subtitle */
--color-banner-sky: oklch(70% 0.12 220); /* #29B6F6 - sky blue */
```

### Step 3: Add Hero Section Variant Tokens
Add new section for hero backgrounds:

```css
/* Hero section - light theme variant */
--color-hero-bg: oklch(97% 0.01 240); /* Light blue-gray */
--color-hero-text: oklch(25% 0.08 240); /* Dark text */
--color-hero-accent: oklch(25% 0.12 260); /* #1A237E Navy accent - validated */
```

### Step 4: Add Gradient Utility for Light Hero
Add after `.gradient-overlay` class:

```css
.gradient-hero-light {
  background: linear-gradient(
    to bottom,
    oklch(97% 0 0) 0%,
    oklch(95% 0.01 240) 100%
  );
}
```

## Todo List
- [ ] Add body/section background tokens
- [ ] Add banner-matched accent tokens
- [ ] Add hero section variant tokens
- [ ] Add gradient utility for light hero
- [ ] Verify OKLCH values render correctly
- [ ] Test dark mode compatibility

## Success Criteria
- All new tokens defined in globals.css
- Tokens use OKLCH color space
- Values match gov standard palette
- No breaking changes to existing styles

## Risk Assessment
- **Low**: Adding new tokens does not affect existing styles
- Mitigation: Keep existing primary-* tokens unchanged

## Security Considerations
- N/A (CSS changes only)

## Next Steps
- Proceed to [Phase 02: Update Hero Section](./phase-02-update-hero-section.md)
