# Phase 5: Admin Dashboard Enhancement

## Context Links
- [Plan Overview](./plan.md)
- [Phase 4: Login Auth](./phase-04-login-auth-flow.md)
- [Current Dashboard](../../web/src/pages/admin/dashboard.tsx)
- [Dashboard Components](../../web/src/components/dashboard/)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 4h
- **Description:** Enhance admin dashboard with government branding, larger stats cards, and improved visual hierarchy

## Key Insights
- Current dashboard functional but generic
- Stats cards could be larger for visibility
- Quick actions need better touch targets
- Activity feed text too small
- Needs official government feel

## Requirements

### Functional
- Update color scheme to government palette
- Enlarge stats cards with clearer numbers
- Improve quick actions with larger buttons
- Add government header/branding
- Improve activity feed readability

### Non-Functional
- Touch targets: 48px minimum
- Stat numbers: 32px+ for visibility
- Text: 16px minimum for all content
- Maintain performance on data load

## Architecture

### Component Updates
```
dashboard/
├── stats-card.tsx      # Modify - larger numbers, gov colors
├── stats-grid.tsx      # Modify - spacing adjustments
├── activity-feed.tsx   # Modify - larger text, better spacing
├── pending-tasks.tsx   # Modify - larger touch targets
├── quick-actions.tsx   # Modify - bigger buttons, icon+text
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/pages/admin/dashboard.tsx` | Header styling, layout spacing |
| `web/src/components/dashboard/stats-card.tsx` | Larger numbers, gov accent colors |
| `web/src/components/dashboard/stats-grid.tsx` | Responsive gap adjustments |
| `web/src/components/dashboard/activity-feed.tsx` | Larger text, timestamps |
| `web/src/components/dashboard/pending-tasks.tsx` | Touch-friendly task items |
| `web/src/components/dashboard/quick-actions.tsx` | Larger buttons, clear labels |

## Implementation Steps

### 1. Update Stats Card
```tsx
// web/src/components/dashboard/stats-card.tsx
// Changes:
// - Value font size: 32px -> 40px
// - Title font size: 14px -> 16px
// - Icon background: use gov-blue-light
// - Border-left accent with gov-blue
// - Min height: 120px
// - Padding: p-5 -> p-6

export function StatsCard({ title, value, icon, loading }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl border-l-4 border-l-gov-blue p-6 min-h-[120px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base text-muted-foreground font-medium">{title}</p>
          <p className="text-4xl font-bold text-foreground mt-2">
            {loading ? <Skeleton className="h-10 w-20" /> : value.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="p-3 bg-gov-blue-light rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}
```

### 2. Update Stats Grid
```tsx
// web/src/components/dashboard/stats-grid.tsx
// Increase gap for touch-friendliness
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {children}
</div>
```

### 3. Update Activity Feed
```tsx
// web/src/components/dashboard/activity-feed.tsx
// Changes:
// - Item padding: py-3 -> py-4
// - Text size: text-sm -> text-base
// - Timestamp: visible, not too small (14px)
// - Activity icon: 40px circle
// - Card min-height for empty state

<div className="bg-card rounded-xl border p-6">
  <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
  <div className="space-y-4">
    {activities.map(activity => (
      <div key={activity.id} className="flex items-start gap-4 py-4 border-b last:border-b-0">
        <div className="w-10 h-10 rounded-full bg-gov-blue-light flex items-center justify-center">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base text-foreground">{activity.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatRelativeTime(activity.createdAt)}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
```

### 4. Update Pending Tasks
```tsx
// web/src/components/dashboard/pending-tasks.tsx
// Changes:
// - Task item: min-height 56px
// - Checkbox: 24px x 24px (touch-friendly)
// - Task text: 16px
// - Priority badges: larger, clearer

<div className="flex items-center gap-4 py-3 min-h-[56px]">
  <input
    type="checkbox"
    className="w-6 h-6 rounded border-2 border-gray-300 accent-gov-blue"
  />
  <span className="text-base flex-1">{task.title}</span>
  <PriorityBadge priority={task.priority} />
</div>
```

### 5. Update Quick Actions
```tsx
// web/src/components/dashboard/quick-actions.tsx
// Changes:
// - Button height: 48px -> 56px
// - Always show icon + text
// - Use gov-blue for primary actions
// - Clear hover/focus states

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Link
    to="/admin/villages/new"
    className="flex items-center justify-center gap-3 bg-gov-blue text-white
               rounded-xl min-h-[56px] px-4 font-medium hover:bg-gov-blue-dark
               focus-visible:ring-4 focus-visible:ring-gov-gold"
  >
    <Plus className="w-5 h-5" />
    <span>Thêm thôn</span>
  </Link>
  {/* More actions... */}
</div>
```

### 6. Update Dashboard Page Header
```tsx
// web/src/pages/admin/dashboard.tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
    <p className="text-muted-foreground mt-1">
      Xin chào, {userDoc?.displayName}
    </p>
  </div>
  <div className="text-base text-muted-foreground bg-muted px-4 py-2 rounded-lg">
    Cập nhật: {formatDateTime(new Date())}
  </div>
</div>
```

## Todo List

- [ ] Update stats-card.tsx with larger values (40px)
- [ ] Add border-left accent to stats cards
- [ ] Update stats-grid.tsx gap to 6
- [ ] Update activity-feed.tsx with larger text
- [ ] Increase activity item icons to 40px
- [ ] Update pending-tasks.tsx with 56px items
- [ ] Enlarge checkbox to 24px
- [ ] Update quick-actions.tsx with 56px buttons
- [ ] Always show icon + text on actions
- [ ] Update dashboard header with greeting
- [ ] Apply gov-blue color throughout
- [ ] Verify all touch targets >= 48px
- [ ] Test loading states
- [ ] Run build and verify

## Success Criteria
- [ ] Stats numbers visible from distance (40px)
- [ ] All interactive elements >= 48px
- [ ] Government blue accent visible
- [ ] Activity feed readable (16px+)
- [ ] Quick actions show icon + text
- [ ] No layout shift on data load

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Larger cards push content below fold | Low | Prioritize most important stats |
| Loading states cause layout shift | Medium | Use skeleton with fixed dimensions |
| Colors look different on low-end screens | Low | Test on Android emulator |

## Security Considerations
- Dashboard data already protected by auth
- No new security concerns

## Next Steps
- After completion, proceed to [Phase 6: Mobile Navigation](./phase-06-mobile-navigation.md)
