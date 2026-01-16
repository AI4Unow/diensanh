import { useState } from 'react'
import { Send, MessageSquare, Users, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useSMSMessages, useSMSStats, useSendSMS } from '@/hooks/use-sms'
import { useVillages } from '@/hooks/use-villages'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { ComposeModal } from './compose-modal'
import type { SMSRecipient } from '@/lib/sms'
import type { SMSStatus } from '@/types'

const statusConfig: Record<SMSStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Đang chờ', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  sent: { label: 'Đã gửi', color: 'text-blue-600 bg-blue-50', icon: Send },
  delivered: { label: 'Đã nhận', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  failed: { label: 'Thất bại', color: 'text-red-600 bg-red-50', icon: XCircle },
}

export function SMSPage() {
  const { user } = useAuth()
  const { data: messages, isLoading } = useSMSMessages({ limit: 20 })
  const { data: stats } = useSMSStats()
  const { data: villages } = useVillages()
  const sendSMS = useSendSMS()

  const [showCompose, setShowCompose] = useState(false)
  const [selectedVillages, setSelectedVillages] = useState<string[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [recipientType, setRecipientType] = useState<'all' | 'villages' | 'custom'>('all')
  const [customPhones, setCustomPhones] = useState('')

  const handleSend = async () => {
    if (!messageContent.trim() || !user) return

    let recipients: SMSRecipient[] = []

    if (recipientType === 'custom') {
      // Parse custom phone numbers
      const phones = customPhones.split(/[,\n]/).map((p) => p.trim()).filter(Boolean)
      recipients = phones.map((phone) => ({ phone }))
    } else {
      // TODO: Fetch actual phone numbers from households
      // For now, use mock data
      recipients = [
        { phone: '0901234567', name: 'Test User 1' },
        { phone: '0912345678', name: 'Test User 2' },
      ]
    }

    if (recipients.length === 0) {
      alert('Vui lòng chọn người nhận')
      return
    }

    try {
      await sendSMS.mutateAsync({
        recipients,
        content: messageContent,
        sentBy: user.uid,
        targetVillages: recipientType === 'villages' ? selectedVillages : undefined,
      })
      setShowCompose(false)
      setMessageContent('')
      setSelectedVillages([])
      setCustomPhones('')
    } catch (error) {
      console.error('Failed to send SMS:', error)
      alert('Gửi tin nhắn thất bại')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tin nhắn SMS</h1>
            <p className="text-muted-foreground">Gửi thông báo đến người dân</p>
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
            )}
          >
            <Send className="w-4 h-4" />
            Soạn tin nhắn
          </button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
                <div className="text-sm text-muted-foreground">Tổng tin nhắn</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
                <div className="text-sm text-muted-foreground">Đã gửi</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.totalFailed || 0}</div>
                <div className="text-sm text-muted-foreground">Thất bại</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ thành công</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message History */}
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Lịch sử tin nhắn</h2>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4" />
              Lọc
            </button>
          </div>
          <div className="divide-y">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 w-48 bg-muted rounded mb-2" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ))
            ) : messages?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có tin nhắn nào
              </div>
            ) : (
              messages?.map((msg) => {
                const config = statusConfig[msg.status]
                const StatusIcon = config.icon
                return (
                  <div key={msg.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.recipients.length} người nhận
                          </span>
                        </div>
                        <p className="text-sm truncate">{msg.content}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {msg.deliveredCount} gửi thành công, {msg.failedCount} thất bại
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {msg.createdAt?.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          villages={villages || []}
          selectedVillages={selectedVillages}
          setSelectedVillages={setSelectedVillages}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
          recipientType={recipientType}
          setRecipientType={setRecipientType}
          customPhones={customPhones}
          setCustomPhones={setCustomPhones}
          onSend={handleSend}
          onClose={() => setShowCompose(false)}
          isPending={sendSMS.isPending}
        />
      )}
    </AdminLayout>
  )
}
