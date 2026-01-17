import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Calendar
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTasks, useTaskStats } from '@/hooks/use-tasks'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Chờ xử lý', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  in_progress: { label: 'Đang thực hiện', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  completed: { label: 'Hoàn thành', color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { label: 'Đã hủy', color: 'text-gray-600', bgColor: 'bg-gray-50' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Thấp', color: 'text-gray-500' },
  medium: { label: 'Trung bình', color: 'text-yellow-600' },
  high: { label: 'Cao', color: 'text-red-600' },
}

const typeLabels: Record<Task['type'], string> = {
  survey: 'Khảo sát',
  notification: 'Thông báo',
  report: 'Báo cáo',
  other: 'Khác',
}

export function TasksPage() {
  const { userDoc } = useAuth()
  const isVillageLeader = userDoc?.role === 'village_leader'

  const { data: tasks, isLoading } = useTasks(
    isVillageLeader ? { villageId: userDoc.villageId } : undefined
  )
  const { data: stats } = useTaskStats()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const filteredTasks = tasks?.filter((task) =>
    statusFilter === 'all' || task.status === statusFilter
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý công việc</h1>
            <p className="text-muted-foreground">
              {isVillageLeader ? 'Công việc được giao' : 'Giao việc cho các thôn'}
            </p>
          </div>
          {!isVillageLeader && (
            <Link
              to="/admin/tasks/new"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
              )}
            >
              <Plus className="w-4 h-4" />
              Tạo công việc
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-5 gap-4">
          <StatCard
            icon={ClipboardList}
            label="Tổng công việc"
            value={stats?.total || 0}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Chờ xử lý"
            value={stats?.pending || 0}
            color="yellow"
          />
          <StatCard
            icon={AlertTriangle}
            label="Đang thực hiện"
            value={stats?.inProgress || 0}
            color="purple"
          />
          <StatCard
            icon={CheckCircle}
            label="Hoàn thành"
            value={stats?.completed || 0}
            color="green"
          />
          <StatCard
            icon={XCircle}
            label="Quá hạn"
            value={stats?.overdue || 0}
            color="red"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-muted hover:bg-muted/80'
            )}
          >
            Tất cả
          </button>
          {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status ? 'bg-primary-600 text-white' : 'bg-muted hover:bg-muted/80'
              )}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-card rounded-xl border">
          <div className="divide-y">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-5 w-48 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              ))
            ) : filteredTasks?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có công việc nào
              </div>
            ) : (
              filteredTasks?.map((task) => <TaskRow key={task.id} task={task} isVillageLeader={isVillageLeader} />)
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof ClipboardList
  label: string
  value: number
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}

function TaskRow({ task, isVillageLeader }: { task: Task; isVillageLeader?: boolean }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() &&
    task.status !== 'completed' && task.status !== 'cancelled'

  return (
    <Link
      to={isVillageLeader ? `/village/tasks/${task.id}` : `/admin/tasks/${task.id}`}
      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bgColor, status.color)}>
            {status.label}
          </span>
          <span className={cn('text-xs font-medium', priority.color)}>
            {priority.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {typeLabels[task.type]}
          </span>
        </div>
        <h3 className="font-medium truncate">{task.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{task.assignedTo.length} thôn được giao</span>
          {task.dueDate && (
            <span className={cn('flex items-center gap-1', isOverdue && 'text-red-600')}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('vi-VN')}
              {isOverdue && ' (Quá hạn)'}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
  )
}
