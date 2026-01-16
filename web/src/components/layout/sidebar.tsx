import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  ClipboardList,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { NationalEmblem } from '@/components/ui/national-emblem'

interface SidebarProps {
  open: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

// Admin menu items
const adminMenu = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Building2, label: 'Quản lý thôn', path: '/admin/villages' },
  { icon: Users, label: 'Hộ gia đình', path: '/admin/households' },
  { icon: MessageSquare, label: 'Tin nhắn SMS', path: '/admin/messages' },
  { icon: ClipboardList, label: 'Công việc', path: '/admin/tasks' },
  { icon: FileText, label: 'Yêu cầu', path: '/admin/requests' },
  { icon: Megaphone, label: 'Thông báo', path: '/admin/announcements' },
  { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
  { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
]

// Village leader menu items
const villageMenu = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/village' },
  { icon: Users, label: 'Hộ gia đình', path: '/village/households' },
  { icon: ClipboardList, label: 'Công việc', path: '/village/tasks' },
  { icon: FileText, label: 'Yêu cầu', path: '/village/requests' },
  { icon: Megaphone, label: 'Thông báo', path: '/village/announcements' },
]

export function Sidebar({ open, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { userDoc } = useAuth()
  const location = useLocation()
  const menu = userDoc?.role === 'commune_admin' ? adminMenu : villageMenu

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r transition-all duration-300',
          // Desktop
          'hidden lg:block',
          open ? 'lg:w-64' : 'lg:w-16',
          // Mobile
          mobileOpen && 'block w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-shrink-0">
              <NationalEmblem size={open || mobileOpen ? "md" : "sm"} />
            </div>
            {(open || mobileOpen) && (
              <span className="font-semibold text-sm whitespace-nowrap">
                UBND Xã Diên Sanh
              </span>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:flex p-1 hover:bg-muted rounded transition-transform',
              !open && 'rotate-180'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && item.path !== '/village' && location.pathname.startsWith(item.path))

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-muted cursor-pointer',
                  'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  isActive && 'bg-primary-50 text-primary-700 font-medium',
                  !open && !mobileOpen && 'justify-center'
                )}
                style={{ minHeight: 'var(--spacing-touch)' }}
                title={!open && !mobileOpen ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {/* Always show text for accessibility, hide visually when collapsed */}
                <span className={cn(
                  'truncate',
                  !open && !mobileOpen && 'sr-only'
                )}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
