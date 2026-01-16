# Phase 7: Accessibility Audit & Polish

## Context Links
- [Plan Overview](./plan.md)
- [Phase 6: Mobile Navigation](./phase-06-mobile-navigation.md)
- [Gov Portal UX Standards](./research/researcher-01-gov-portal-ux-standards.md)
- [React + Tailwind Patterns](./research/researcher-02-react-tailwind-patterns.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 2h
- **Description:** Comprehensive accessibility audit and final polish to ensure WCAG AAA compliance

## Key Insights
From research checklist:
- Keyboard navigation (tab order logical)
- Screen reader labels (ARIA landmarks)
- Skip-to-content link
- Focus indicators (visible 4px outline)
- Alt text for all images
- Form error announcements
- Language attribute on HTML tag

## Requirements

### Functional
- Add skip-to-content link
- Ensure all images have alt text
- Add ARIA landmarks to layouts
- Ensure form errors announced
- Add high-contrast mode toggle
- Verify keyboard navigation order

### Non-Functional
- Lighthouse Accessibility: >=90
- All contrast ratios: 7:1+ (AAA)
- All touch targets: 48px+
- Tab order matches visual order

## Architecture

### Audit Areas
```
1. Skip Links & Landmarks
2. Image Alt Text Audit
3. Form Accessibility
4. Keyboard Navigation
5. Color Contrast Verification
6. High-Contrast Mode Toggle
7. Screen Reader Testing
8. Performance Validation
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/index.html` | Add lang="vi", meta viewport |
| `web/src/App.tsx` | Add skip-to-content link |
| `web/src/components/layout/admin-layout.tsx` | Add ARIA landmarks |
| `web/src/components/layout/portal-layout.tsx` | Add ARIA landmarks |
| `web/src/styles/globals.css` | High-contrast toggle styles |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/components/a11y/skip-link.tsx` | Skip to main content link |
| `web/src/components/a11y/high-contrast-toggle.tsx` | Toggle for high-contrast mode |
| `web/src/hooks/use-high-contrast.ts` | Hook for contrast preference |

## Implementation Steps

### 1. Add Language and Viewport Meta
```html
<!-- web/index.html -->
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
  <!-- ... -->
</head>
```

### 2. Create Skip Link Component
```tsx
// web/src/components/a11y/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                 focus:z-[100] focus:bg-gov-blue focus:text-white focus:px-6 focus:py-3
                 focus:rounded-lg focus:text-lg focus:font-medium focus:outline-none
                 focus:ring-4 focus:ring-gov-gold"
    >
      Bỏ qua đến nội dung chính
    </a>
  )
}
```

### 3. Add ARIA Landmarks
```tsx
// web/src/components/layout/admin-layout.tsx
<div className="min-h-screen bg-muted">
  <SkipLink />

  {/* Navigation landmark */}
  <nav aria-label="Menu chính">
    <Sidebar ... />
  </nav>

  <div>
    <header role="banner">
      <TopNavbar ... />
    </header>

    <main id="main-content" role="main" aria-label="Nội dung chính">
      {children}
    </main>

    <footer role="contentinfo">
      <GovernmentFooter />
    </footer>
  </div>

  <nav aria-label="Menu di động" className="lg:hidden">
    <MobileNav />
  </nav>
</div>
```

### 4. Audit All Images for Alt Text
```tsx
// Check all img tags have meaningful alt
// National emblem: alt="Quốc huy Việt Nam"
// User avatars: alt={`Ảnh đại diện của ${user.name}`}
// Decorative images: alt="" + aria-hidden="true"
```

### 5. Form Accessibility Improvements
```tsx
// Ensure all form fields have:
// - Associated <label> (htmlFor matches id)
// - aria-describedby for hints
// - aria-invalid for error state
// - Role="alert" on error messages

<div>
  <label htmlFor="phone" className="block text-lg font-medium mb-2">
    Số điện thoại
  </label>
  <input
    id="phone"
    type="tel"
    aria-describedby="phone-hint"
    aria-invalid={!!error}
    ...
  />
  <p id="phone-hint" className="text-sm text-muted-foreground mt-2">
    Nhập số điện thoại 10 chữ số
  </p>
  {error && (
    <p role="alert" className="text-destructive mt-2">
      {error}
    </p>
  )}
</div>
```

### 6. Create High-Contrast Toggle
```tsx
// web/src/hooks/use-high-contrast.ts
export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(() => {
    // Check localStorage or system preference
    return localStorage.getItem('high-contrast') === 'true' ||
           window.matchMedia('(prefers-contrast: more)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('theme-high-contrast', highContrast)
    localStorage.setItem('high-contrast', String(highContrast))
  }, [highContrast])

  return [highContrast, setHighContrast] as const
}
```

```tsx
// web/src/components/a11y/high-contrast-toggle.tsx
export function HighContrastToggle() {
  const [highContrast, setHighContrast] = useHighContrast()

  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="flex items-center gap-2 min-h-[48px] px-4"
      aria-pressed={highContrast}
    >
      <Eye className="w-5 h-5" />
      <span>Chế độ tương phản cao</span>
    </button>
  )
}
```

### 7. Verify Keyboard Navigation
```markdown
Test checklist:
- [ ] Tab through all interactive elements
- [ ] Tab order matches visual order
- [ ] Focus visible on all elements (4px outline)
- [ ] Escape closes modals/dropdowns
- [ ] Enter activates buttons/links
- [ ] Space toggles checkboxes
- [ ] Arrow keys navigate menus
```

### 8. Run Lighthouse Audit
```bash
# In Chrome DevTools
# 1. Open page
# 2. F12 > Lighthouse > Accessibility
# 3. Run audit
# 4. Fix any issues <90 score
```

### 9. Color Contrast Verification
```markdown
Use WebAIM Contrast Checker for each combination:
- [ ] Body text (#0f172a) on white: 13.7:1 ✓
- [ ] Gov-blue (#004A99) on white: 7.2:1 ✓
- [ ] Muted text (#64748b) on white: 5.3:1 (check if >18px)
- [ ] Error text on error-bg: verify
- [ ] Button text on button-bg: verify
```

### 10. Screen Reader Testing
```markdown
Test with VoiceOver (Mac) or NVDA (Windows):
- [ ] Page title announced
- [ ] Landmarks announced
- [ ] Headings navigable
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Interactive elements have names
```

## Todo List

- [ ] Add lang="vi" to html tag
- [ ] Create skip-link.tsx component
- [ ] Add skip link to App.tsx
- [ ] Add ARIA landmarks to admin-layout.tsx
- [ ] Add ARIA landmarks to portal-layout.tsx
- [ ] Audit all images for alt text
- [ ] Add aria-describedby to form hints
- [ ] Add role="alert" to error messages
- [ ] Create use-high-contrast.ts hook
- [ ] Create high-contrast-toggle.tsx component
- [ ] Add high-contrast toggle to settings/footer
- [ ] Run keyboard navigation test
- [ ] Run Lighthouse accessibility audit
- [ ] Fix any issues to reach >=90
- [ ] Verify all contrast ratios
- [ ] Test with screen reader
- [ ] Document any remaining issues

## Success Criteria
- [ ] Lighthouse Accessibility >= 90
- [ ] Skip link functional and visible on focus
- [ ] All landmarks properly labeled
- [ ] All images have appropriate alt text
- [ ] Form errors announced by screen reader
- [ ] High-contrast mode available
- [ ] Tab order logical throughout app
- [ ] Focus visible on all interactive elements

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Screen reader compat issues | Medium | Test with multiple readers |
| Lighthouse score fluctuates | Low | Run multiple times, take average |
| High-contrast breaks design | Medium | Test thoroughly before release |

## Security Considerations
- Skip link does not expose sensitive areas
- Contrast toggle preference stored locally only

## Final Notes
After this phase, all 7 phases are complete. Schedule user testing with elderly residents to validate improvements in real-world usage.

## Unresolved Questions
1. Do we have access to elderly users for usability testing?
2. Which screen readers do Vietnamese elderly users commonly use?
3. Are there specific government accessibility certification requirements?
