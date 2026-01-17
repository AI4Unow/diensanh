import { Link } from 'react-router-dom'
import { Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useTasks } from '@/hooks/use-tasks'

const priorityConfig = {
  high: { label: 'Cao', color: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Trung bình', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Thấp', color: 'bg-green-50 text-green-700 border-green-200' },
}

export function PendingTasks() {
  const { userDoc } = useAuth()
  const isVillageLeader = userDoc?.role === 'village_leader'

  const { data: tasks, isLoading } = useTasks({
    status: 'pending',
    villageId: isVillageLeader ? userDoc.villageId : undefined
  })

  const viewAllLink = isVillageLeader ? '/village/tasks' : '/admin/tasks'

  // Sort by due date (nearest first) and take top 5
  const displayTasks = tasks
    ?.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.getTime() - b.dueDate.getTime()
    })
    .slice(0, 5) ?? []

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Công việc cần làm</h2>
        <Link
          to={viewAllLink}
          className="text-base text-primary-600 hover:underline flex items-center gap-2 cursor-pointer"
          style={{ minHeight: 'var(--spacing-touch)' }}
        >
          Xem tất cả
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
        ) : displayTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-base">Không có công việc nào</div>
          </div>
        ) : (
          displayTasks.map((task) => {
            const priority = priorityConfig[task.priority]
            const isOverdue = task.dueDate ? task.dueDate < new Date() : false
            const isDueSoon = task.dueDate ? !isOverdue && task.dueDate < new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : false

            return (
              <Link
                key={task.id}
                to={isVillageLeader ? `/village/tasks/${task.id}` : `/admin/tasks/${task.id}`}
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
                        {task.assignedTo?.length ?? 0} thôn
                      </span>
                    </div>
                  </div>
                  {task.dueDate && (
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
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
