# Phase 03: Admin Dashboard & Navigation

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02: Firestore Schema](./phase-02-firestore-schema-security.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 - Critical Path |
| Status | pending |
| Effort | 14h |
| Dependencies | Phase 01, 02 complete |

Build admin dashboard with statistics cards, responsive sidebar navigation, and role-based menu items.

---

## Key Insights
- Dashboard must work offline (show cached stats)
- Vietnamese date/number formatting required
- Mobile-first responsive design
- Use skeleton loaders for better perceived performance

---

## Requirements

### Functional
- FR1: Display key statistics (villages, households, residents, pending tasks)
- FR2: Recent activity feed
- FR3: Quick actions panel
- FR4: Responsive sidebar with role-based menu

### Non-Functional
- NFR1: Dashboard loads <2s on 3G
- NFR2: Works offline with cached data
- NFR3: Mobile-friendly (collapsible sidebar)

---

## Architecture

### Component Structure
```
src/components/
├── layout/
│   ├── admin-layout.tsx       # Main layout wrapper
│   ├── sidebar.tsx            # Collapsible sidebar
│   ├── top-navbar.tsx         # Top bar with user menu
│   ├── mobile-nav.tsx         # Bottom nav for mobile
│   └── offline-banner.tsx     # Offline indicator
├── dashboard/
│   ├── stats-card.tsx         # Statistic card component
│   ├── stats-grid.tsx         # Grid of stat cards
│   ├── activity-feed.tsx      # Recent activity list
│   ├── quick-actions.tsx      # Quick action buttons
│   └── pending-tasks.tsx      # Pending tasks widget

src/pages/admin/
├── dashboard.tsx              # Admin dashboard page
└── index.tsx                  # Admin section index
```

### Navigation Menu (Admin)
```typescript
const adminMenu = [
  { icon: 'LayoutDashboard', label: 'Tổng quan', path: '/admin' },
  { icon: 'Building2', label: 'Quản lý thôn', path: '/admin/villages' },
  { icon: 'Users', label: 'Hộ gia đình', path: '/admin/households' },
  { icon: 'MessageSquare', label: 'Tin nhắn SMS', path: '/admin/messages' },
  { icon: 'ClipboardList', label: 'Công việc', path: '/admin/tasks' },
  { icon: 'FileText', label: 'Yêu cầu', path: '/admin/requests' },
  { icon: 'Megaphone', label: 'Thông báo', path: '/admin/announcements' },
  { icon: 'BarChart3', label: 'Báo cáo', path: '/admin/reports' },
  { icon: 'Settings', label: 'Cài đặt', path: '/admin/settings' },
]
```

### Navigation Menu (Village Leader)
```typescript
const villageMenu = [
  { icon: 'LayoutDashboard', label: 'Tổng quan', path: '/village' },
  { icon: 'Users', label: 'Hộ gia đình', path: '/village/households' },
  { icon: 'ClipboardList', label: 'Công việc', path: '/village/tasks' },
  { icon: 'FileText', label: 'Yêu cầu', path: '/village/requests' },
  { icon: 'Megaphone', label: 'Thông báo', path: '/village/announcements' },
]
```

---

## Related Code Files

### Create
- `src/components/layout/admin-layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/top-navbar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/offline-banner.tsx`
- `src/components/dashboard/stats-card.tsx`
- `src/components/dashboard/stats-grid.tsx`
- `src/components/dashboard/activity-feed.tsx`
- `src/components/dashboard/quick-actions.tsx`
- `src/pages/admin/dashboard.tsx`
- `src/pages/admin/index.tsx`
- `src/pages/village/dashboard.tsx`
- `src/hooks/use-dashboard-stats.ts`

### Modify
- `src/routes/index.tsx` - Add admin routes

---

## Implementation Steps

### 1. Install UI Dependencies (0.5h)
```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority
```

### 2. Create AdminLayout (2h)
```typescript
// src/components/layout/admin-layout.tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isOnline = useNetworkStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnline && <OfflineBanner />}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={cn('transition-all', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      <MobileNav className="lg:hidden" />
    </div>
  )
}
```

### 3. Create Sidebar (2.5h)
```typescript
// src/components/layout/sidebar.tsx
export function Sidebar({ open, onToggle }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const menu = user?.role === 'commune_admin' ? adminMenu : villageMenu

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all',
      open ? 'w-64' : 'w-16'
    )}>
      <div className="p-4 border-b">
        <img src="/logo.png" alt="Diên Sanh" className="h-8" />
        {open && <span className="ml-2 font-semibold">UBND Xã Diên Sanh</span>}
      </div>
      <nav className="p-2 space-y-1">
        {menu.map((item) => (
          <NavLink key={item.path} to={item.path} ... />
        ))}
      </nav>
    </aside>
  )
}
```

### 4. Create StatsCard Component (1h)
```typescript
// src/components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  loading?: boolean
}

export function StatsCard({ title, value, icon, trend, loading }: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value.toLocaleString('vi-VN')}</div>
        {trend && (
          <div className={cn('text-sm', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            {trend.isPositive ? '+' : ''}{trend.value}% so với tháng trước
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5. Create Dashboard Stats Hook (1.5h)
```typescript
// src/hooks/use-dashboard-stats.ts
export function useDashboardStats() {
  const { db } = useFirestore()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [villages, tasks, requests, messages] = await Promise.all([
        getDocs(collection(db, 'villages')),
        getDocs(query(collection(db, 'tasks'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'requests'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'messages'), where('status', '==', 'sent'))),
      ])

      const totalHouseholds = villages.docs.reduce(
        (sum, doc) => sum + (doc.data().householdCount || 0), 0
      )
      const totalResidents = villages.docs.reduce(
        (sum, doc) => sum + (doc.data().residentCount || 0), 0
      )

      return {
        villageCount: villages.size,
        householdCount: totalHouseholds,
        residentCount: totalResidents,
        pendingTasks: tasks.size,
        pendingRequests: requests.size,
        sentMessages: messages.size,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### 6. Build Dashboard Page (2.5h)
```typescript
// src/pages/admin/dashboard.tsx
export function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <div className="text-sm text-gray-500">
          Cập nhật: {format(new Date(), 'HH:mm dd/MM/yyyy', { locale: vi })}
        </div>
      </div>

      <StatsGrid>
        <StatsCard
          title="Số thôn"
          value={stats?.villageCount ?? 0}
          icon={<Building2 />}
          loading={isLoading}
        />
        <StatsCard
          title="Hộ gia đình"
          value={stats?.householdCount ?? 0}
          icon={<Home />}
          loading={isLoading}
        />
        <StatsCard
          title="Nhân khẩu"
          value={stats?.residentCount ?? 0}
          icon={<Users />}
          loading={isLoading}
        />
        <StatsCard
          title="Việc cần làm"
          value={stats?.pendingTasks ?? 0}
          icon={<ClipboardList />}
          loading={isLoading}
        />
      </StatsGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <PendingTasks />
      </div>

      <QuickActions />
    </div>
  )
}
```

### 7. Create Activity Feed (1.5h)
Fetch recent activity from tasks, requests, messages collections.

### 8. Create Quick Actions Panel (1h)
Buttons for common actions: Add household, Send SMS, Create task, etc.

### 9. Add Routes (0.5h)
```typescript
// src/routes/admin-routes.tsx
const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/villages', element: <VillagesPage /> },
  // ...
]
```

### 10. Test Responsive Design (1h)
- Test on mobile viewport
- Test sidebar collapse
- Test offline mode
- Test Vietnamese number formatting

---

## Todo List
- [ ] Install Radix UI components
- [ ] Create AdminLayout component
- [ ] Create responsive Sidebar
- [ ] Create TopNavbar with user menu
- [ ] Create MobileNav (bottom navigation)
- [ ] Create OfflineBanner component
- [ ] Create StatsCard with skeleton loader
- [ ] Create useDashboardStats hook
- [ ] Build AdminDashboard page
- [ ] Create ActivityFeed component
- [ ] Create QuickActions panel
- [ ] Setup admin routes
- [ ] Test responsive design
- [ ] Test offline data display

---

## Success Criteria
- [ ] Dashboard displays all key statistics
- [ ] Sidebar collapses on mobile
- [ ] Navigation works for both roles
- [ ] Offline banner shows when disconnected
- [ ] Cached data displays when offline
- [ ] Vietnamese formatting correct
- [ ] No layout shift on load

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow initial load | Medium | Use skeleton loaders, stale-while-revalidate |
| Navigation confusion | Low | User testing with commune staff |
| Mobile usability | Medium | Bottom nav + gesture support |

---

## Security Considerations
- Hide admin-only menu items for village leaders
- Validate role before rendering admin pages
- No sensitive data in sidebar labels

---

## Next Steps
After completion:
1. → Phase 04: Village Management Module
2. Gather feedback from commune staff
3. Add analytics tracking
