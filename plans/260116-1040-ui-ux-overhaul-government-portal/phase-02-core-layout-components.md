# Phase 2: Core Layout Components

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1: Design System](./phase-01-design-system-foundation.md)
- [Gov Portal UX Standards](./research/researcher-01-gov-portal-ux-standards.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** 4h
- **Description:** Redesign header, footer, and sidebar with official government branding including National Emblem

## Key Insights
- National emblem MUST be in top-left (standard position)
- Standardized footer required (contact, privacy, accessibility statement)
- Breadcrumb navigation required per Decree 42/2022
- Icon + text always (never icons alone) for elderly accessibility

## Requirements

### Functional
- Add National Emblem to header/sidebar
- Create official government-styled header with agency identification
- Add standardized footer with contact, privacy, accessibility links
- Add breadcrumb navigation component
- Ensure all nav items have icon + text labels

### Non-Functional
- Header/footer consistent across all pages
- Mobile-responsive (emblem scales appropriately)
- Load emblem from local assets (no external CDN)

## Architecture

### Component Structure
```
layout/
├── government-header.tsx    # New - official header with emblem
├── government-footer.tsx    # New - standardized footer
├── breadcrumb.tsx           # New - breadcrumb navigation
├── sidebar.tsx              # Modify - add emblem, ensure icon+text
├── admin-layout.tsx         # Modify - integrate new header/footer
├── portal-layout.tsx        # New - layout for public portal pages
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/components/layout/sidebar.tsx` | Replace "DS" logo with emblem, ensure icon+text labels |
| `web/src/components/layout/admin-layout.tsx` | Integrate government footer |
| `web/src/components/layout/top-navbar.tsx` | Update styling to match government branding |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/components/layout/government-header.tsx` | Official header with emblem for portal |
| `web/src/components/layout/government-footer.tsx` | Standardized footer component |
| `web/src/components/layout/breadcrumb.tsx` | Breadcrumb navigation component |
| `web/src/components/layout/portal-layout.tsx` | Layout wrapper for public portal pages |
| `web/src/assets/images/national-emblem.svg` | Vietnamese national emblem SVG |

## Implementation Steps

### 1. Create National Emblem Asset
- Source official Vietnamese national emblem SVG
- Optimize for web (remove unnecessary metadata)
- Save to `web/src/assets/images/national-emblem.svg`
- Create emblem component for reuse

```tsx
// web/src/components/ui/national-emblem.tsx
export function NationalEmblem({ className }: { className?: string }) {
  return (
    <img
      src="/images/national-emblem.svg"
      alt="Quốc huy Việt Nam"
      className={cn("w-12 h-12", className)}
    />
  )
}
```

### 2. Create Government Header
```tsx
// Key elements:
// - National emblem (left)
// - Agency name: "UBND XÃ DIÊN SANH"
// - Subtitle: "Tỉnh Quảng Trị"
// - Optional: Search bar, login button
```

### 3. Create Government Footer
```tsx
// Required sections per Decree 42/2022:
// - Contact info (address, phone, email)
// - Working hours
// - Quick links (Privacy, Accessibility, Sitemap)
// - Copyright notice
// - Government red/gold accent border
```

### 4. Create Breadcrumb Component
```tsx
// Features:
// - Auto-generate from router location
// - Home icon + "Trang chủ" as first item
// - Touch-friendly links (48px height)
// - Separator with chevron
```

### 5. Update Sidebar
- Replace "DS" box with National Emblem (scaled down)
- Ensure all menu items show icon + text (even collapsed)
- Add tooltip for collapsed state
- Update colors to government palette

### 6. Create Portal Layout
- Wrapper for public-facing pages
- Includes: GovernmentHeader, main content, GovernmentFooter
- Mobile-responsive with sticky header

### 7. Update Admin Layout
- Add government footer
- Ensure sidebar uses new emblem
- Add breadcrumb below top navbar

## Todo List

- [ ] Source and add national-emblem.svg asset
- [ ] Create NationalEmblem component
- [ ] Create government-header.tsx with emblem, agency name
- [ ] Create government-footer.tsx with required sections
- [ ] Create breadcrumb.tsx component
- [ ] Update sidebar.tsx with emblem and icon+text
- [ ] Create portal-layout.tsx wrapper
- [ ] Update admin-layout.tsx with footer and breadcrumb
- [ ] Ensure all touch targets >= 48px
- [ ] Test on mobile viewport
- [ ] Run build to verify no errors

## Success Criteria
- [ ] National emblem visible on all pages (header or sidebar)
- [ ] Footer contains contact, privacy, accessibility links
- [ ] Breadcrumb shows current page path
- [ ] All navigation items have icon + text
- [ ] Mobile layout is usable (no overlapping elements)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Emblem SVG too heavy | Low | Optimize with SVGO |
| Breadcrumb breaks on deep routes | Medium | Limit to 3 levels, use ellipsis |
| Footer clutters mobile | Medium | Collapsible sections on mobile |

## Security Considerations
- Emblem must be served locally (no external links)
- Footer links should not expose internal URLs

## Next Steps
- After completion, proceed to [Phase 3: Portal Homepage Redesign](./phase-03-portal-homepage-redesign.md)
