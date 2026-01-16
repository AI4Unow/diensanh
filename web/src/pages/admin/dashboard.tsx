import { Building2, Home, Users, ClipboardList, FileText, MessageSquare } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { PendingTasks } from '@/components/dashboard/pending-tasks'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { formatDateTime } from '@/lib/utils'

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <div className="text-sm text-muted-foreground">
            Cập nhật: {formatDateTime(new Date())}
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid>
          <StatsCard
            title="Số thôn/KDC"
            value={stats?.villageCount ?? 0}
            icon={<Building2 className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Hộ gia đình"
            value={stats?.householdCount ?? 0}
            icon={<Home className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Nhân khẩu"
            value={stats?.residentCount ?? 0}
            icon={<Users className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Việc cần làm"
            value={stats?.pendingTasks ?? 0}
            icon={<ClipboardList className="w-5 h-5" />}
            loading={isLoading}
          />
        </StatsGrid>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Yêu cầu chờ xử lý"
            value={stats?.pendingRequests ?? 0}
            icon={<FileText className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="SMS đã gửi"
            value={stats?.sentMessages ?? 0}
            icon={<MessageSquare className="w-5 h-5" />}
            loading={isLoading}
          />
        </div>

        {/* Activity and Tasks */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <PendingTasks />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </AdminLayout>
  )
}
