import { Menu, Bell, User, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface TopNavbarProps {
  onMenuClick: () => void
  onSidebarToggle: () => void
  sidebarOpen: boolean
}

export function TopNavbar({ onMenuClick, onSidebarToggle, sidebarOpen }: TopNavbarProps) {
  const { userDoc, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case 'commune_admin':
        return 'Quản trị viên xã'
      case 'village_leader':
        return 'Trưởng thôn'
      default:
        return 'Cư dân'
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className={cn(
            'hidden lg:flex p-2 hover:bg-muted rounded-lg transition-transform',
            !sidebarOpen && 'rotate-180'
          )}
          aria-label={sidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="p-2 hover:bg-muted rounded-lg relative"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium truncate max-w-[120px]">
                {userDoc?.displayName || 'Người dùng'}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRoleLabel(userDoc?.role)}
              </div>
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b sm:hidden">
                <div className="text-sm font-medium">
                  {userDoc?.displayName || 'Người dùng'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getRoleLabel(userDoc?.role)}
                </div>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
