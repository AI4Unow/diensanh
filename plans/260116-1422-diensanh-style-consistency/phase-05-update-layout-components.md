# Phase 5: Update Layout Components

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)
- **Prerequisites:** Phase 2 (colors), Phase 4 (component library)

## Overview
- **Date:** 2026-01-16
- **Priority:** P2
- **Status:** pending
- **Effort:** 1.5h

Update layout components (header, navigation, footer, containers) to use new color tokens and design patterns from target website.

## Key Insights

### Layout Components to Update
1. `government-header.tsx` - Update colors, ensure sticky
2. `government-footer.tsx` - Match target footer style
3. `mobile-nav.tsx` - Bottom nav with 56px items
4. `top-navbar.tsx` - Admin nav styling
5. `sidebar.tsx` - Admin sidebar
6. `breadcrumb.tsx` - Navigation trail

### Target Patterns
- **Banner**: Full-width commune banner at page top (from gov website)
- Header: Navy blue (#1E3A8A), sticky, 16px padding
- Bottom nav: White bg, 4-column grid, 56px items
- Footer: Navy blue bg, white text
- Breadcrumbs: 14px gray text, chevron separators

### Banner Asset
**URL:** `https://diensanh.quangtri.gov.vn/documents/790019/0/bannner-xa-dien-sanh.jpg`
- Download and save to `web/public/images/banner-xa-dien-sanh.jpg`
- Use as hero banner at top of public pages

## Requirements

### Functional
- Add commune banner at top of public pages
- Update header to navy blue background
- Ensure sticky header with proper z-index
- Bottom nav 4-column grid with 56px min-height items
- Replace hardcoded colors with semantic tokens

### Non-Functional
- 48px+ touch targets maintained
- WCAG AAA contrast
- Mobile-first responsive

## Architecture

### Header Structure (Target)
```css
.header {
  background: oklch(40% 0.10 240); /* Navy blue */
  color: white;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
}
```

### Bottom Navigation Structure (Target)
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
  border-top: 1px solid border;
  padding: 8px 0;
  grid-template-columns: repeat(4, 1fr);
}

.bottom-nav-item {
  min-height: 56px;
}
```

## Related Code Files

### To Modify
- `web/src/components/layout/government-header.tsx`
- `web/src/components/layout/government-footer.tsx`
- `web/src/components/layout/mobile-nav.tsx`
- `web/src/components/layout/top-navbar.tsx`
- `web/src/components/layout/sidebar.tsx`
- `web/src/components/layout/breadcrumb.tsx`

### To Modify (use new components)
- `web/src/components/auth/login-form.tsx` - use Button/Input
- `web/src/components/dashboard/stats-card.tsx` - use Card
- `web/src/components/portal/quick-access-card.tsx` - use Card
- `web/src/components/portal/hotline-button.tsx` - use Button

## Implementation Steps

### 0. Download and Add Banner Image

```bash
# Download banner from gov website
curl -o web/public/images/banner-xa-dien-sanh.jpg \
  "https://diensanh.quangtri.gov.vn/documents/790019/0/bannner-xa-dien-sanh.jpg"
```

### 0.1 Create Banner Component

```tsx
// web/src/components/layout/commune-banner.tsx
export function CommuneBanner() {
  return (
    <div className="w-full">
      <img
        src="/images/banner-xa-dien-sanh.jpg"
        alt="UBND Xã Diễn Sanh - Huyện Hải Lăng - Tỉnh Quảng Trị"
        className="w-full h-auto object-cover"
        loading="eager"
      />
    </div>
  )
}
```

### 0.2 Add Banner to Public Layout

```tsx
// In public page layouts (e.g., portal-layout.tsx or App.tsx)
import { CommuneBanner } from '@/components/layout/commune-banner'

<CommuneBanner />
<GovernmentHeader />
{/* rest of content */}
```

### 1. Update government-header.tsx

**Current:**
```tsx
"bg-white border-b-4 border-gov-red shadow-sm"
```

**Target:**
```tsx
"bg-primary-600 text-white sticky top-0 z-50 shadow-md"
// With red accent bar at top
<div className="h-1 bg-gov-red w-full" />
```

### 2. Update government-footer.tsx

**Target styles:**
```tsx
<footer className="bg-primary-900 text-primary-100 py-8">
  {/* Content */}
</footer>
```

### 3. Update mobile-nav.tsx

**Target styles:**
```tsx
<nav className={cn(
  "fixed bottom-0 left-0 right-0 z-50",
  "bg-card border-t border-border",
  "grid grid-cols-4",
  "pb-safe" // Safe area for iOS
)}>
  <NavItem className="min-h-14 flex flex-col items-center justify-center" />
</nav>
```

### 4. Update breadcrumb.tsx

**Target styles:**
```tsx
<nav className="text-sm text-text-secondary py-3">
  <ol className="flex items-center gap-2">
    <li>Trang chủ</li>
    <li>/</li>
    <li className="text-text-primary">Current Page</li>
  </ol>
</nav>
```

### 5. Replace Hardcoded Colors in Components

**stats-card.tsx:**
```tsx
// Before
"text-green-600" → "text-success"
"text-red-600" → "text-error"

// After
"text-success"
"text-error"
```

**hotline-button.tsx:**
```tsx
// Use Button component
<Button variant="primary" size="lg" className="bg-gov-red hover:bg-gov-red/90">
  <Phone className="h-5 w-5 mr-2" />
  Hotline: 1900 xxxx
</Button>
```

### 6. Update login-form.tsx to use Button/Input

**Before:**
```tsx
<input className="px-5 py-4 rounded-lg border bg-background focus:ring-4 focus:ring-gov-gold min-h-[56px]" />
<button className="bg-primary-600 hover:bg-primary-700 ..." />
```

**After:**
```tsx
import { Button, Input } from '@/components/ui'

<Input placeholder="Số điện thoại" error={!!errors.phone} />
<Button variant="primary" size="lg">Đăng nhập</Button>
```

### 7. Update stats-card.tsx to use Card

**Before:**
```tsx
<div className="bg-card rounded-xl border-l-4 border-l-primary-600 p-6 shadow-sm">
```

**After:**
```tsx
import { Card } from '@/components/ui'

<Card variant="accent">
  {/* content */}
</Card>
```

### 8. Build and Visual Test

```bash
cd web && npm run build && npm run dev
```

Check:
- Header appears navy blue with red accent
- Bottom nav has proper spacing
- All touch targets 48px+
- Semantic colors for success/error

## Todo List
- [ ] Download banner image to web/public/images/
- [ ] Create commune-banner.tsx component
- [ ] Add banner to public layout (above header)
- [ ] Update government-header.tsx (navy bg + red accent)
- [ ] Update government-footer.tsx (dark navy)
- [ ] Update mobile-nav.tsx (56px items)
- [ ] Update breadcrumb.tsx (14px gray)
- [ ] Replace green-600/red-600 with success/error
- [ ] Update login-form.tsx with Button/Input
- [ ] Update stats-card.tsx with Card
- [ ] Update hotline-button.tsx with Button
- [ ] Build and test all pages

## Success Criteria
- Commune banner displays at top of public pages
- Header is navy blue with sticky behavior
- No hardcoded Tailwind color utilities (green-600, red-600)
- All layout components use semantic tokens
- New Button/Input/Card components used where applicable
- 48px+ touch targets verified

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Medium | Medium | Test each component |
| Import errors | Low | Low | Check @/ alias config |
| Missing token | Low | High | Verify tokens exist first |

## Security Considerations
None - styling updates only.

## Next Steps
Proceed to [Phase 6: Apply Visual Effects](./phase-06-apply-visual-effects.md)
