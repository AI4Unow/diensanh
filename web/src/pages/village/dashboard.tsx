import { Home, Users, ClipboardList, FileText } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { PendingTasks } from '@/components/dashboard/pending-tasks'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useAuth } from '@/hooks/use-auth'
import { useVillage } from '@/hooks/use-villages'
import { useTasks } from '@/hooks/use-tasks'
import { formatDateTime } from '@/lib/utils'

export function VillageDashboardPage() {
  const { userDoc } = useAuth()
  const { data: village, isLoading: isLoadingVillage } = useVillage(userDoc?.villageId)
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(
    userDoc?.villageId ? { villageId: userDoc.villageId, status: 'pending' } : undefined
  )

  const isLoading = isLoadingVillage || isLoadingTasks

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Tổng quan</h1>
            {village && (
              <p className="text-muted-foreground">{village.name}</p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Cập nhật: {formatDateTime(new Date())}
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid>
          <StatsCard
            title="Hộ gia đình"
            value={village?.householdCount ?? 0}
            icon={<Home className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Nhân khẩu"
            value={village?.residentCount ?? 0}
            icon={<Users className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Việc cần làm"
            value={tasks?.length ?? 0}
            icon={<ClipboardList className="w-5 h-5" />}
            loading={isLoading}
          />
          <StatsCard
            title="Yêu cầu đã gửi"
            value={0}
            icon={<FileText className="w-5 h-5" />}
            loading={isLoading}
          />
        </StatsGrid>

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
