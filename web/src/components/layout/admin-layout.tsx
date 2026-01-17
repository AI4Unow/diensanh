import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'
import { MobileNav } from './mobile-nav'
import { OfflineBanner } from './offline-banner'
import { GovernmentFooter } from './government-footer'
import { Breadcrumb } from './breadcrumb'
import { SkipLink } from '@/components/a11y/skip-link'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface AdminLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isOnline = useNetworkStatus()

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <SkipLink />

      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Desktop Sidebar - Navigation landmark */}
      <nav aria-label="Menu chính">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </nav>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 flex-1 flex flex-col',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <header role="banner">
          <TopNavbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
        </header>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Đường dẫn" className="bg-white border-b px-4 lg:px-6 py-3">
            <Breadcrumb items={breadcrumbs} />
          </nav>
        )}

        <main id="main-content" role="main" aria-label="Nội dung chính" className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Government Footer */}
        <footer role="contentinfo">
          <GovernmentFooter />
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Menu di động" className="lg:hidden">
        <MobileNav onMoreClick={() => setMobileSidebarOpen(true)} />
      </nav>
    </div>
  )
}
