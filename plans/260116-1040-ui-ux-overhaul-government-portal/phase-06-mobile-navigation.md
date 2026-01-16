# Phase 6: Mobile Navigation & Touch Optimization

## Context Links
- [Plan Overview](./plan.md)
- [Phase 5: Admin Dashboard](./phase-05-admin-dashboard.md)
- [Current Mobile Nav](../../web/src/components/layout/mobile-nav.tsx)
- [React + Tailwind Patterns](./research/researcher-02-react-tailwind-patterns.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 2h
- **Description:** Optimize mobile navigation for elderly users with larger touch targets and thumb-friendly placement

## Key Insights
- Bottom navigation is in thumb-friendly zone (good)
- Current nav items too small (64px width, icons 20px)
- Labels too small (12px)
- Need 8px minimum gap between touch targets
- Consider "More" menu for secondary items

## Requirements

### Functional
- Increase bottom nav touch targets to 56px height
- Enlarge icons to 24px
- Increase label size to 14px
- Ensure 8px gaps between items
- Add active state with gov-blue highlight
- Fix "More" menu for additional navigation

### Non-Functional
- Smooth transitions on active state
- No gesture requirements (tap only)
- Works on 320px viewport

## Architecture

### Component Updates
```
layout/
├── mobile-nav.tsx          # Major update - larger targets
├── mobile-more-menu.tsx    # New - full-screen menu for additional items
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/components/layout/mobile-nav.tsx` | Larger touch targets, icons, labels |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/components/layout/mobile-more-menu.tsx` | Full-screen additional menu |
| `web/src/pages/admin/more.tsx` | More menu page for admin |
| `web/src/pages/village/more.tsx` | More menu page for village |

## Implementation Steps

### 1. Update Mobile Nav Component
```tsx
// web/src/components/layout/mobile-nav.tsx
// Changes:
// - Nav height: 64px -> 72px (with safe area)
// - Touch target: 64px width -> full flex, 56px height
// - Icons: 20px -> 24px
// - Labels: 12px -> 14px
// - Active: gov-blue text + indicator bar
// - Gap: automatic with justify-around

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t
                    pb-safe lg:hidden">
      <div className="flex items-stretch justify-around h-[72px]">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = /* ... */

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1',
                'min-h-[56px] gap-1 relative',
                'transition-colors duration-200',
                isActive
                  ? 'text-gov-blue'
                  : 'text-muted-foreground'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-1
                                 bg-gov-blue rounded-b" />
              )}
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
```

### 2. Create Mobile More Menu Page
```tsx
// web/src/pages/admin/more.tsx
// Full-screen menu with all additional options

export function AdminMorePage() {
  return (
    <AdminLayout>
      <div className="space-y-2 p-4">
        <h1 className="text-2xl font-bold mb-6">Thêm</h1>

        {/* Secondary menu items as large cards */}
        <MenuCard
          icon={<MessageSquare />}
          label="Tin nhắn SMS"
          href="/admin/messages"
        />
        <MenuCard
          icon={<FileText />}
          label="Yêu cầu"
          href="/admin/requests"
        />
        <MenuCard
          icon={<Megaphone />}
          label="Thông báo"
          href="/admin/announcements"
        />
        <MenuCard
          icon={<BarChart3 />}
          label="Báo cáo"
          href="/admin/reports"
        />
        <MenuCard
          icon={<Settings />}
          label="Cài đặt"
          href="/admin/settings"
        />
      </div>
    </AdminLayout>
  )
}

// MenuCard component
function MenuCard({ icon, label, href }: MenuCardProps) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border
                 min-h-[64px] hover:bg-muted transition-colors"
    >
      <div className="w-12 h-12 bg-gov-blue-light rounded-lg
                      flex items-center justify-center text-gov-blue">
        {icon}
      </div>
      <span className="text-lg font-medium">{label}</span>
      <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
    </Link>
  )
}
```

### 3. Add Safe Area Inset Support
```css
/* web/src/styles/globals.css */
/* Add safe area utility */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### 4. Update Mobile Nav Items
```tsx
// Reduce to 4 primary items for mobile
const adminMobileMenu = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Building2, label: 'Thôn', path: '/admin/villages' },
  { icon: Users, label: 'Hộ dân', path: '/admin/households' },
  { icon: Menu, label: 'Thêm', path: '/admin/more' },
]
```

### 5. Ensure 8px Gap Between Targets
```tsx
// Use justify-around with max-width constraint
<div className="flex items-stretch justify-around h-[72px] max-w-md mx-auto">
  {/* Items automatically get ~8px gap with justify-around */}
</div>
```

### 6. Add Route for More Pages
```tsx
// Add to router configuration
{ path: '/admin/more', element: <AdminMorePage /> }
{ path: '/village/more', element: <VillageMorePage /> }
```

## Todo List

- [ ] Update mobile-nav.tsx with 72px height
- [ ] Enlarge icons to 24px (w-6 h-6)
- [ ] Increase labels to 14px (text-sm)
- [ ] Add active indicator bar
- [ ] Apply gov-blue for active state
- [ ] Create mobile-more-menu.tsx component
- [ ] Create admin/more.tsx page
- [ ] Create village/more.tsx page
- [ ] Add pb-safe utility for iPhone X+
- [ ] Add routes for more pages
- [ ] Test on 320px viewport
- [ ] Verify no overlapping touch targets
- [ ] Test thumb reach zones
- [ ] Run build and verify

## Success Criteria
- [ ] Bottom nav 72px height
- [ ] All nav items have 56px touch area
- [ ] Icons 24px, labels 14px
- [ ] Active state clearly visible
- [ ] More menu accessible and complete
- [ ] Works on iPhone X (safe area)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Safe area not supported on old Android | Low | Fallback padding value |
| More page adds extra tap | Low | Most used items in main nav |
| Labels truncate on small screens | Medium | Use short labels |

## Security Considerations
- None - navigation only

## Next Steps
- After completion, proceed to [Phase 7: Accessibility Audit](./phase-07-accessibility-audit.md)
