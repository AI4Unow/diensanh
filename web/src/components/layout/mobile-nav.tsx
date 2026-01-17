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

interface MobileNavProps {
  onMoreClick: () => void
}

export function MobileNav({ onMoreClick }: MobileNavProps) {
  const { userDoc } = useAuth()
  const location = useLocation()
  const menu = userDoc?.role === 'commune_admin' ? adminMobileMenu : villageMobileMenu

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t pb-safe lg:hidden">
      <div className="flex items-stretch justify-around h-[72px] max-w-md mx-auto">
        {menu.map((item) => {
          const Icon = item.icon
          const isMore = item.path.endsWith('/more')
          const isActive = !isMore && (location.pathname === item.path ||
            (item.path !== '/admin' && item.path !== '/village' && location.pathname.startsWith(item.path)))

          if (isMore) {
            return (
              <button
                key={item.path}
                onClick={onMoreClick}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 gap-1 relative',
                  'min-h-[56px] transition-colors duration-200 cursor-pointer',
                  'text-muted-foreground hover:text-primary-600'
                )}
                style={{ minHeight: 'var(--spacing-touch-lg)' }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-1 relative',
                'min-h-[56px] transition-colors duration-200 cursor-pointer',
                isActive ? 'text-primary-600' : 'text-muted-foreground'
              )}
              style={{ minHeight: 'var(--spacing-touch-lg)' }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-1 bg-primary-600 rounded-b" />
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
