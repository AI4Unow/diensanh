import { Link } from 'react-router-dom'
import { FileText, Megaphone, ChevronRight } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'

interface MenuCardProps {
  icon: React.ReactNode
  label: string
  href: string
  description?: string
}

function MenuCard({ icon, label, href, description }: MenuCardProps) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:bg-muted transition-colors cursor-pointer"
      style={{ minHeight: 'var(--spacing-touch)' }}
    >
      <div className="w-12 h-12 bg-gov-blue-light rounded-lg flex items-center justify-center text-primary-600">
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-lg font-medium text-foreground">{label}</span>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
  )
}

export function VillageMorePage() {
  const breadcrumbs = [
    { label: 'Thêm', current: true }
  ]

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold mb-6">Thêm chức năng</h1>

        {/* Secondary menu items for village leaders */}
        <MenuCard
          icon={<FileText className="w-6 h-6" />}
          label="Yêu cầu"
          description="Quản lý yêu cầu từ người dân"
          href="/village/requests"
        />

        <MenuCard
          icon={<Megaphone className="w-6 h-6" />}
          label="Thông báo"
          description="Đăng thông báo cho thôn"
          href="/village/announcements"
        />
      </div>
    </AdminLayout>
  )
}