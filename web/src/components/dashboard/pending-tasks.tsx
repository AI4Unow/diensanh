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
  high: { label: 'Cao', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Trung bình', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Thấp', color: 'bg-green-100 text-green-700' },
}

export function PendingTasks() {
  // TODO: Replace with real data from useQuery
  const tasks = mockTasks

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Công việc cần làm</h2>
        <Link
          to="/admin/tasks"
          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
        >
          Xem tất cả
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Không có công việc nào
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
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', priority.color)}>
                        {priority.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.assignedVillages} thôn
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs whitespace-nowrap',
                    isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {isOverdue ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
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
