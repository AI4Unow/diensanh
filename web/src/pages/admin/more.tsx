import { Link } from 'react-router-dom'
import { MessageSquare, FileText, Megaphone, BarChart3, Settings, ChevronRight } from 'lucide-react'
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

export function AdminMorePage() {
  const breadcrumbs = [
    { label: 'Thêm', current: true }
  ]

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold mb-6">Thêm chức năng</h1>

        {/* Secondary menu items as large cards */}
        <MenuCard
          icon={<MessageSquare className="w-6 h-6" />}
          label="Tin nhắn SMS"
          description="Gửi tin nhắn SMS đến người dân"
          href="/admin/messages"
        />

        <MenuCard
          icon={<FileText className="w-6 h-6" />}
          label="Yêu cầu"
          description="Quản lý yêu cầu từ người dân"
          href="/admin/requests"
        />

        <MenuCard
          icon={<Megaphone className="w-6 h-6" />}
          label="Thông báo"
          description="Đăng thông báo công khai"
          href="/admin/announcements"
        />

        <MenuCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Báo cáo"
          description="Xem báo cáo thống kê"
          href="/admin/reports"
        />

        <MenuCard
          icon={<Settings className="w-6 h-6" />}
          label="Cài đặt"
          description="Cấu hình hệ thống"
          href="/admin/settings"
        />
      </div>
    </AdminLayout>
  )
}