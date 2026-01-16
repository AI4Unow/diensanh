import { Link } from 'react-router-dom'
import { Plus, MessageSquare, ClipboardList, Megaphone, FileText, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface QuickAction {
  icon: typeof Plus
  label: string
  description: string
  path: string
  color: string
}

const adminActions: QuickAction[] = [
  {
    icon: Users,
    label: 'Thêm hộ dân',
    description: 'Đăng ký hộ gia đình mới',
    path: '/admin/households/new',
    color: 'bg-blue-500',
  },
  {
    icon: MessageSquare,
    label: 'Gửi SMS',
    description: 'Gửi tin nhắn hàng loạt',
    path: '/admin/messages/new',
    color: 'bg-green-500',
  },
  {
    icon: ClipboardList,
    label: 'Tạo công việc',
    description: 'Giao việc cho trưởng thôn',
    path: '/admin/tasks/new',
    color: 'bg-amber-500',
  },
  {
    icon: Megaphone,
    label: 'Đăng thông báo',
    description: 'Thông báo đến người dân',
    path: '/admin/announcements/new',
    color: 'bg-purple-500',
  },
]

const villageActions: QuickAction[] = [
  {
    icon: Users,
    label: 'Thêm hộ dân',
    description: 'Đăng ký hộ gia đình mới',
    path: '/village/households/new',
    color: 'bg-blue-500',
  },
  {
    icon: FileText,
    label: 'Gửi yêu cầu',
    description: 'Gửi yêu cầu lên xã',
    path: '/village/requests/new',
    color: 'bg-green-500',
  },
  {
    icon: ClipboardList,
    label: 'Xem công việc',
    description: 'Công việc được giao',
    path: '/village/tasks',
    color: 'bg-amber-500',
  },
]

export function QuickActions() {
  const { userDoc } = useAuth()
  const actions = userDoc?.role === 'commune_admin' ? adminActions : villageActions

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Thao tác nhanh</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.path}
                to={action.path}
                className="group flex flex-col items-center p-4 rounded-lg border border-transparent
                  ring-2 ring-transparent
                  hover:ring-primary-200 hover:border-primary-300 hover:bg-primary-50/50
                  focus-visible:ring-primary-500 focus-visible:ring-offset-2
                  transition-all duration-200 cursor-pointer"
              >
                <div className={cn('p-3 rounded-full text-white mb-2', action.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-center">{action.label}</div>
                <div className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                  {action.description}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
