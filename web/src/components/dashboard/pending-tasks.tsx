import { Link } from 'react-router-dom'
import { Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface PendingTask {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate: Date
  assignedVillages: number
}

// Mock data - will be replaced with real data from Firestore
const mockTasks: PendingTask[] = [
  {
    id: '1',
    title: 'Khảo sát dân số quý 1/2026',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
    assignedVillages: 20,
  },
  {
    id: '2',
    title: 'Cập nhật thông tin hộ nghèo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    assignedVillages: 20,
  },
  {
    id: '3',
    title: 'Báo cáo tình hình an ninh tháng 1',
    priority: 'low',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
    assignedVillages: 5,
  },
]

const priorityConfig = {
  high: { label: 'Cao', color: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Trung bình', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Thấp', color: 'bg-green-50 text-green-700 border-green-200' },
}

export function PendingTasks() {
  // TODO: Replace with real data from useQuery
  const tasks = mockTasks

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Công việc cần làm</h2>
        <Link
          to="/admin/tasks"
          className="text-base text-primary-600 hover:underline flex items-center gap-2 cursor-pointer"
          style={{ minHeight: 'var(--spacing-touch)' }}
        >
          Xem tất cả
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-base">Không có công việc nào</div>
          </div>
        ) : (
          tasks.map((task) => {
            const priority = priorityConfig[task.priority]
            const isOverdue = task.dueDate < new Date()
            const isDueSoon = !isOverdue && task.dueDate < new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)

            return (
              <Link
                key={task.id}
                to={`/admin/tasks/${task.id}`}
                className="block p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch-lg)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base text-foreground leading-relaxed">{task.title}</div>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className={cn('text-sm px-3 py-1 rounded-full border', priority.color)}>
                        {priority.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {task.assignedVillages} thôn
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-2 text-sm whitespace-nowrap',
                    isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {isOverdue ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
