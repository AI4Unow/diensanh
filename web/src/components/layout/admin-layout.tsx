import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'
import { MobileNav } from './mobile-nav'
import { OfflineBanner } from './offline-banner'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isOnline = useNetworkStatus()

  return (
    <div className="min-h-screen bg-muted">
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Desktop Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <TopNavbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
