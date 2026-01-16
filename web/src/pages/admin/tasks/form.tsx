import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTask, useCreateTask, useUpdateTask } from '@/hooks/use-tasks'
import { useVillages } from '@/hooks/use-villages'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { TaskType, TaskPriority } from '@/types'

const typeOptions: { value: TaskType; label: string }[] = [
  { value: 'survey', label: 'Khảo sát' },
  { value: 'notification', label: 'Thông báo' },
  { value: 'report', label: 'Báo cáo' },
  { value: 'other', label: 'Khác' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
]

export function TaskFormPage() {
  const { taskId } = useParams<{ taskId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = !!taskId

  const { data: task, isLoading: loadingTask } = useTask(taskId)
  const { data: villages } = useVillages()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'notification' as TaskType,
    priority: 'medium' as TaskPriority,
    assignedTo: [] as string[],
    dueDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      })
    }
  }, [task, isEditing])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề'
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả'
    if (formData.assignedTo.length === 0) newErrors.assignedTo = 'Vui lòng chọn ít nhất một thôn'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !user) return

    try {
      const data = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      }

      if (isEditing && taskId) {
        await updateTask.mutateAsync({ id: taskId, ...data })
        navigate(`/admin/tasks/${taskId}`)
      } else {
        const newId = await createTask.mutateAsync({ ...data, createdBy: user.uid })
        navigate(`/admin/tasks/${newId}`)
      }
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const toggleVillage = (villageId: string) => {
    if (formData.assignedTo.includes(villageId)) {
      setFormData({ ...formData, assignedTo: formData.assignedTo.filter((v) => v !== villageId) })
    } else {
      setFormData({ ...formData, assignedTo: [...formData.assignedTo, villageId] })
    }
  }

  const selectAllVillages = () => {
    if (villages) {
      setFormData({ ...formData, assignedTo: villages.map((v) => v.id) })
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  if (isEditing && loadingTask) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/tasks" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Sửa công việc' : 'Tạo công việc mới'}
            </h1>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{isEditing ? 'Cập nhật' : 'Tạo'}</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Khảo sát tình hình dân cư"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.title && 'border-red-500'
              )}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Type & Priority */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Loại công việc</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Mô tả chi tiết công việc cần thực hiện..."
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none',
                errors.description && 'border-red-500'
              )}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Hạn hoàn thành</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Assigned Villages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Giao cho thôn <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={selectAllVillages}
                className="text-xs text-primary-600 hover:underline"
              >
                Chọn tất cả
              </button>
            </div>
            <div className={cn(
              'flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg',
              errors.assignedTo && 'border-red-500'
            )}>
              {villages?.map((village) => (
                <button
                  key={village.id}
                  type="button"
                  onClick={() => toggleVillage(village.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    formData.assignedTo.includes(village.id)
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {village.name}
                </button>
              ))}
            </div>
            {errors.assignedTo && <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>}
            {formData.assignedTo.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Đã chọn {formData.assignedTo.length} thôn
              </p>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
