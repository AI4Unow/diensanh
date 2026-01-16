import { Clock, FileText, MessageSquare, ClipboardList, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'task' | 'request' | 'message' | 'user'
  title: string
  description: string
  timestamp: Date
}

// Mock data - will be replaced with real data from Firestore
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'request',
    title: 'Yêu cầu mới',
    description: 'Nguyễn Văn A gửi yêu cầu xác nhận hộ khẩu',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: '2',
    type: 'task',
    title: 'Công việc hoàn thành',
    description: 'Thôn Định Thọ hoàn thành khảo sát dân số',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    type: 'message',
    title: 'SMS đã gửi',
    description: 'Gửi thông báo họp đến 150 hộ dân',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: '4',
    type: 'user',
    title: 'Trưởng thôn mới',
    description: 'Trần Văn B được bổ nhiệm trưởng thôn Định Hòa',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

const iconMap = {
  task: ClipboardList,
  request: FileText,
  message: MessageSquare,
  user: User,
}

const colorMap = {
  task: 'bg-blue-100 text-blue-600',
  request: 'bg-amber-100 text-amber-600',
  message: 'bg-green-100 text-green-600',
  user: 'bg-purple-100 text-purple-600',
}

export function ActivityFeed() {
  // TODO: Replace with real data from useQuery
  const activities = mockActivities

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Hoạt động gần đây</h2>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Chưa có hoạt động nào
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.type]
            return (
              <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${colorMap[activity.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
