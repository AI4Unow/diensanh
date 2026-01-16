# Phase 2: Color Token Refinement

## Context Links

- [Color & Typography Research](research/researcher-01-color-typography.md)

## Overview

| Priority | Status | Effort |
|----------|--------|--------|
| P1 (High) | pending | 45min |

Refine color tokens for government-official appearance with WCAG AAA compliance and semantic status colors.

## Key Insights from Research

- Navy blue (oklch(32% 0.15 260)) conveys government trust
- 60%+ of government sites use blue as primary
- WCAG AAA requires 7:1 contrast for normal text
- Semantic status colors improve accessibility
- **OKLCH format** for wider color gamut and perceptual uniformity

## Requirements

### Functional

- Update primary CTA color to authoritative blue (OKLCH)
- Add semantic status tokens (success, warning, error, info) in OKLCH
- Ensure all text meets 7:1 contrast ratio

### Non-functional

- No visual regression on existing components
- Dark mode tokens remain functional
- Consistent with Vietnamese government aesthetic

## Related Code Files

| Action | File Path |
|--------|-----------|
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/styles/globals.css` |

## Implementation Steps

### 1. Add semantic status colors to @theme

Add after existing color tokens (using OKLCH):

```css
/* Status colors - WCAG AAA compliant (OKLCH) */
--color-success: oklch(62% 0.19 145);            /* Green */
--color-success-foreground: oklch(100% 0 0);
--color-warning: oklch(65% 0.18 60);             /* Amber */
--color-warning-foreground: oklch(100% 0 0);
--color-error: oklch(55% 0.22 25);               /* Red */
--color-error-foreground: oklch(100% 0 0);
--color-info: oklch(60% 0.16 240);               /* Blue */
--color-info-foreground: oklch(100% 0 0);
```

### 2. Update primary button color

Update to government authoritative blue in OKLCH:

```css
/* Primary CTA - government authoritative blue */
--color-primary-cta: oklch(40% 0.22 265);       /* Deep vibrant blue */
```

### 3. Add dark mode status colors

Add inside dark mode media query:

```css
--color-success: oklch(65% 0.18 150);
--color-warning: oklch(70% 0.16 70);
--color-error: oklch(65% 0.20 25);
--color-info: oklch(65% 0.14 235);
```

## Todo List

- [ ] Add --color-success/warning/error/info tokens
- [ ] Add corresponding foreground tokens
- [ ] Add dark mode variants for status colors
- [ ] Verify contrast ratios with browser DevTools
- [ ] Update any hardcoded green-600/red-600 to use tokens

## Success Criteria

- Status colors available as Tailwind utilities (bg-success, text-warning, etc.)
- All status colors pass WCAG AAA (7:1) on white background
- Dark mode status colors remain visible
- No visual changes to existing components

## Security Considerations

- No security implications for color changes
