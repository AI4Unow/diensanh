import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, CheckCircle, Clock, XCircle,
  Calendar, Users
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { useVillages } from '@/hooks/use-villages'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/types'

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

const typeLabels: Record<string, string> = {
  survey: 'Khảo sát',
  notification: 'Thông báo',
  report: 'Báo cáo',
  other: 'Khác',
}

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading } = useTask(taskId)
  const { data: villages } = useVillages()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!taskId) return
    await updateTask.mutateAsync({
      id: taskId,
      status: newStatus,
      ...(newStatus === 'completed' ? { completedAt: new Date() } : {}),
    })
  }

  const handleDelete = async () => {
    if (!taskId) return
    await deleteTask.mutateAsync(taskId)
    navigate('/admin/tasks')
  }

  const assignedVillages = villages?.filter((v) => task?.assignedTo.includes(v.id)) || []
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() &&
    task.status !== 'completed' && task.status !== 'cancelled'

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  if (!task) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy công việc</p>
          <Link to="/admin/tasks" className="text-primary-600 hover:underline mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/tasks" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bgColor, status.color)}>
                {status.label}
              </span>
              <span className={cn('text-xs font-medium', priority.color)}>
                Ưu tiên: {priority.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/tasks/${taskId}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Sửa</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Xóa</span>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Loại công việc</div>
                <div className="font-semibold">{typeLabels[task.type]}</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Giao cho</div>
                <div className="font-semibold">{assignedVillages.length} thôn</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', isOverdue ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600')}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Hạn hoàn thành</div>
                <div className={cn('font-semibold', isOverdue && 'text-red-600')}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có'}
                  {isOverdue && ' (Quá hạn)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Mô tả công việc</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        </div>

        {/* Assigned Villages */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Thôn được giao</h2>
          <div className="flex flex-wrap gap-2">
            {assignedVillages.map((village) => (
              <Link
                key={village.id}
                to={`/admin/villages/${village.id}`}
                className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
              >
                {village.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Cập nhật trạng thái</h2>
          <div className="flex flex-wrap gap-2">
            {task.status !== 'in_progress' && task.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={updateTask.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                Bắt đầu thực hiện
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={updateTask.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Đánh dấu hoàn thành
              </button>
            )}
            {task.status !== 'cancelled' && task.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={updateTask.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Hủy công việc
              </button>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-sm text-muted-foreground">
          <p>Tạo lúc: {task.createdAt?.toLocaleString('vi-VN')}</p>
          {task.completedAt && <p>Hoàn thành lúc: {task.completedAt.toLocaleString('vi-VN')}</p>}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
            <p className="text-muted-foreground mb-4">
              Bạn có chắc muốn xóa công việc "{task.title}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-muted rounded-lg hover:bg-muted/80"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteTask.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
