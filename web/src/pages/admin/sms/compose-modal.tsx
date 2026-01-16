import { X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Village } from '@/types'

interface ComposeModalProps {
  villages: Village[]
  selectedVillages: string[]
  setSelectedVillages: (villages: string[]) => void
  messageContent: string
  setMessageContent: (content: string) => void
  recipientType: 'all' | 'villages' | 'custom'
  setRecipientType: (type: 'all' | 'villages' | 'custom') => void
  customPhones: string
  setCustomPhones: (phones: string) => void
  onSend: () => void
  onClose: () => void
  isPending: boolean
}

export function ComposeModal({
  villages,
  selectedVillages,
  setSelectedVillages,
  messageContent,
  setMessageContent,
  recipientType,
  setRecipientType,
  customPhones,
  setCustomPhones,
  onSend,
  onClose,
  isPending,
}: ComposeModalProps) {
  const charCount = messageContent.length
  const smsCount = Math.ceil(charCount / 160) || 1

  const toggleVillage = (villageId: string) => {
    if (selectedVillages.includes(villageId)) {
      setSelectedVillages(selectedVillages.filter((v) => v !== villageId))
    } else {
      setSelectedVillages([...selectedVillages, villageId])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Soạn tin nhắn SMS</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Người nhận</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRecipientType('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  recipientType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('villages')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  recipientType === 'villages'
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                Theo thôn
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('custom')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  recipientType === 'custom'
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                Tùy chọn
              </button>
            </div>
          </div>

          {/* Village Selection */}
          {recipientType === 'villages' && (
            <div>
              <label className="block text-sm font-medium mb-2">Chọn thôn</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                {villages.map((village) => (
                  <button
                    key={village.id}
                    type="button"
                    onClick={() => toggleVillage(village.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      selectedVillages.includes(village.id)
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {village.name}
                  </button>
                ))}
              </div>
              {selectedVillages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Đã chọn {selectedVillages.length} thôn
                </p>
              )}
            </div>
          )}

          {/* Custom Phones */}
          {recipientType === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại (mỗi số một dòng hoặc cách nhau bằng dấu phẩy)
              </label>
              <textarea
                value={customPhones}
                onChange={(e) => setCustomPhones(e.target.value)}
                rows={3}
                placeholder="0901234567&#10;0912345678&#10;..."
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung tin nhắn</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung tin nhắn..."
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{charCount} ký tự</span>
              <span>{smsCount} tin nhắn SMS</span>
            </div>
          </div>

          {/* Preview */}
          {messageContent && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">Xem trước:</div>
              <div className="text-sm whitespace-pre-wrap">{messageContent}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSend}
            disabled={isPending || !messageContent.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Gửi tin nhắn
          </button>
        </div>
      </div>
    </div>
  )
}
