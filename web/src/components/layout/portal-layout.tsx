import type { ReactNode } from "react"
import { GovernmentHeader } from "./government-header"
import { GovernmentFooter } from "./government-footer"
import { Breadcrumb } from "./breadcrumb"
import { SkipLink } from "@/components/a11y/skip-link"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface PortalLayoutProps {
  children: ReactNode
  className?: string
  showSearch?: boolean
  showLogin?: boolean
  breadcrumbs?: BreadcrumbItem[]
}

export function PortalLayout({
  children,
  className,
  showSearch = true,
  showLogin = true,
  breadcrumbs = []
}: PortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-body-bg">
      <SkipLink />

      {/* Government Header */}
      <header role="banner">
        <GovernmentHeader showSearch={showSearch} showLogin={showLogin} />
      </header>

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Đường dẫn" className="bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" role="main" aria-label="Nội dung chính" className={cn("flex-1", className)}>
        {children}
      </main>

      {/* Government Footer */}
      <footer role="contentinfo">
        <GovernmentFooter />
      </footer>
    </div>
  )
}