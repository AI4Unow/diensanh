import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, ClipboardList, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Mobile navigation items (simplified for bottom nav)
const adminMobileMenu = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Building2, label: 'Thôn', path: '/admin/villages' },
  { icon: Users, label: 'Hộ dân', path: '/admin/households' },
  { icon: ClipboardList, label: 'Việc', path: '/admin/tasks' },
  { icon: Menu, label: 'Thêm', path: '/admin/more' },
]

const villageMobileMenu = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/village' },
  { icon: Users, label: 'Hộ dân', path: '/village/households' },
  { icon: ClipboardList, label: 'Việc', path: '/village/tasks' },
  { icon: Menu, label: 'Thêm', path: '/village/more' },
]

export function MobileNav() {
  const { userDoc } = useAuth()
  const location = useLocation()
  const menu = userDoc?.role === 'commune_admin' ? adminMobileMenu : villageMobileMenu

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t lg:hidden">
      <div className="flex items-center justify-around h-16">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && item.path !== '/village' && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px]',
                'transition-colors',
                isActive ? 'text-primary-600' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
