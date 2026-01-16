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
  task: 'bg-blue-50 text-blue-600',
  request: 'bg-amber-50 text-amber-600',
  message: 'bg-green-50 text-green-600',
  user: 'bg-purple-50 text-purple-600',
}

export function ActivityFeed() {
  // TODO: Replace with real data from useQuery
  const activities = mockActivities

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-base">Chưa có hoạt động nào</div>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.type]
            return (
              <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-full w-10 h-10 flex items-center justify-center ${colorMap[activity.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base text-foreground">{activity.title}</div>
                    <div className="text-base text-muted-foreground mt-1 leading-relaxed">
                      {activity.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
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
