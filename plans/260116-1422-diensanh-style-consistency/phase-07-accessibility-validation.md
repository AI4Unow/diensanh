# Phase 7: Accessibility Validation

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)
- **Prerequisites:** All previous phases complete

## Overview
- **Date:** 2026-01-16
- **Priority:** P1
- **Status:** pending
- **Effort:** 1.25h

Validate WCAG AAA compliance across all styling changes. Check contrast ratios, touch targets, focus indicators, and screen reader compatibility.

## Key Insights

### WCAG AAA Requirements
- **Normal text (16-18px):** 7:1 contrast minimum
- **Large text (≥18px bold / ≥24px):** 4.5:1 contrast minimum
- **Interactive elements:** 3:1 against adjacent colors
- **Focus indicators:** 3:1 against background

### Touch Target Requirements (Government/Elderly)
- **Minimum:** 48x48px
- **Optimal for elderly:** 56x56px
- **Spacing between targets:** ≥8px

### Current Accessibility Features (Preserve)
- High contrast mode support (@media prefers-contrast)
- Forced colors mode (Windows High Contrast)
- Skip-to-content link
- 18px base font size
- 1.6 line height for Vietnamese

## Requirements

### Functional
- All text passes 7:1 contrast on backgrounds
- All interactive elements ≥48x48px
- Focus indicators visible on all elements
- Skip link functional
- lang="vi" on html

### Non-Functional
- Lighthouse Accessibility ≥90
- No axe-core errors
- Keyboard navigation complete

## Architecture

### Validation Checkpoints
```
1. Color Contrast
   ├── Primary text on white: 7:1+
   ├── Secondary text on white: 7:1+
   ├── Button text on primary bg: 7:1+
   └── Error/success text: 4.5:1+

2. Touch Targets
   ├── All buttons: ≥48px
   ├── All inputs: ≥48px
   ├── Nav items: ≥48px
   └── Spacing between: ≥8px

3. Focus States
   ├── Visible outline: 2px
   ├── Offset: 2px
   └── Contrast: 3:1

4. Screen Reader
   ├── Landmarks (header, main, nav, footer)
   ├── Headings hierarchy (h1 → h6)
   ├── Form labels
   └── Error announcements
```

## Related Code Files

### To Verify/Audit
- `web/src/styles/globals.css` - all color tokens
- `web/src/components/ui/button.tsx` - touch targets
- `web/src/components/ui/input.tsx` - labels, errors
- `web/src/components/layout/*.tsx` - landmarks
- `web/src/components/a11y/skip-link.tsx` - skip link
- `web/index.html` - lang attribute

### To Potentially Fix
- Any component with contrast issues
- Any interactive element <48px

## Implementation Steps

### 1. Contrast Ratio Verification

Use browser DevTools or contrast checker tool:

| Color Pair | Expected | Action |
|------------|----------|--------|
| text-primary (#0F172A) on white | 15:1 | ✓ Pass |
| text-secondary (#334155) on white | 7:1+ | Verify |
| primary-600 (#1E3A8A) on white | 8.5:1 | ✓ Pass |
| white on primary-600 | 8.5:1 | ✓ Pass |
| success on white | 4.5:1+ | Verify |
| error on white | 4.5:1+ | Verify |
| gov-gold on primary-600 | 3:1+ | Verify focus |

**Tool:** WebAIM Contrast Checker or Chrome DevTools

### 2. Touch Target Audit

Check each interactive element:

```bash
# Search for button/input min-height
grep -r "min-h" web/src/components/ --include="*.tsx"
```

Verify:
- [ ] Button: min-h-12 (48px) or min-h-14 (56px)
- [ ] Input: min-h-12 (48px)
- [ ] Nav items: min-h-12 (48px)
- [ ] Checkboxes/radios: wrapped in 48px container

### 3. Focus Indicator Audit

Tab through all pages and verify:
- [ ] Focus outline visible on every interactive element
- [ ] No element loses focus indicator
- [ ] Focus order logical (top→bottom, left→right)
- [ ] Skip link works (Tab → Enter → jumps to main)

### 4. Screen Reader Testing

Use VoiceOver (Mac) or NVDA (Windows):

**Landmarks:**
```html
<header role="banner">
<nav role="navigation">
<main role="main" id="main-content">
<footer role="contentinfo">
```

**Headings:**
- Only one h1 per page
- Headings in order (h1 → h2 → h3)

**Forms:**
- All inputs have labels (explicit or aria-label)
- Error messages announced (aria-live)

### 5. Lighthouse Audit

```bash
# Run Lighthouse via Chrome DevTools or CLI
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=html
```

Target: Accessibility score ≥90

### 6. Axe-Core Automated Testing

Add axe-core to dev dependencies (if not present):
```bash
cd web && npm install --save-dev @axe-core/react
```

Or use browser extension: axe DevTools

### 7. Fix Any Issues Found

Common fixes:
- Add aria-label to icon buttons
- Add sr-only text for icons
- Fix heading hierarchy
- Add form labels
- Increase contrast where needed

### 8. Document Compliance

Create accessibility checklist in docs:
```markdown
## Accessibility Compliance
- [x] WCAG AAA color contrast
- [x] 48px+ touch targets
- [x] Keyboard navigation
- [x] Screen reader landmarks
- [x] Skip to content link
- [x] Vietnamese lang attribute
```

### 9. Verify High Contrast Mode

1. Enable high contrast mode in OS
2. Check app still usable
3. Text readable
4. Focus visible

### 10. Final Build and Test

```bash
cd web && npm run build && npm run dev
```

## Todo List
- [ ] Check all color contrast ratios (7:1 text, 4.5:1 large)
- [ ] Audit all touch targets (≥48px)
- [ ] Tab through all pages for focus visibility
- [ ] Test skip link functionality
- [ ] Verify landmarks (header, nav, main, footer)
- [ ] Check heading hierarchy
- [ ] Verify form labels and error announcements
- [ ] Run Lighthouse accessibility audit
- [ ] Run axe-core scan
- [ ] Fix any issues found
- [ ] Test high contrast mode
- [ ] Verify lang="vi" on html

## Success Criteria
- Lighthouse Accessibility: ≥90
- Axe-core: 0 errors
- All text: 7:1 contrast
- All interactive: ≥48px touch
- Focus visible on all elements
- Skip link functional
- Screen reader navigable

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Contrast failures | Medium | High | Fix colors immediately |
| Touch target too small | Low | Medium | Already set 48px min |
| Missing labels | Medium | Medium | Add aria-labels |
| Lighthouse <90 | Low | Medium | Fix flagged issues |

## Security Considerations
None - accessibility validation only.

## Next Steps
- Document final accessibility status
- Update project documentation with compliance notes
- Consider ongoing a11y testing in CI/CD
