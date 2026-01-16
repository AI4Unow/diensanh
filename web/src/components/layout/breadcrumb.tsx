import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home item */}
        <li>
          <div className="flex items-center">
            <a
              href="/"
              className="text-muted-foreground hover:text-primary-600 transition-colors cursor-pointer flex items-center space-x-1"
              style={{ minHeight: 'var(--spacing-touch)' }}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Trang chủ</span>
            </a>
          </div>
        </li>

        {/* Dynamic breadcrumb items */}
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
              {item.href && !item.current ? (
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-primary-600 transition-colors cursor-pointer"
                  style={{ minHeight: 'var(--spacing-touch)' }}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ) : (
                <span
                  className={cn(
                    "text-sm font-medium",
                    item.current ? "text-primary-600" : "text-muted-foreground"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}