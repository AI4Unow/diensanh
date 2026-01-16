import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Simple FAQ-based responses
const faqResponses: Record<string, string> = {
  'xin chào': 'Xin chào! Tôi là trợ lý ảo của UBND xã Diên Sanh. Tôi có thể giúp bạn:\n- Hướng dẫn thủ tục hành chính\n- Tra cứu thông tin liên hệ\n- Giải đáp thắc mắc chung\n\nBạn cần hỗ trợ gì?',
  'giờ làm việc': 'Giờ làm việc của UBND xã Diên Sanh:\n- Thứ 2 đến Thứ 6\n- Sáng: 7:30 - 11:30\n- Chiều: 13:30 - 17:00\n\nNghỉ thứ 7, Chủ nhật và các ngày lễ.',
  'địa chỉ': 'Địa chỉ: UBND xã Diên Sanh, Tỉnh Quảng Trị.\n\nĐiện thoại: 0233.xxx.xxx\nEmail: ubnd.diensanh@quangtri.gov.vn',
  'xác nhận cư trú': 'Để xin giấy xác nhận cư trú, bạn cần:\n1. CMND/CCCD bản gốc\n2. Sổ hộ khẩu bản gốc\n3. Đơn xin xác nhận (có mẫu tại UBND xã)\n\nThời gian giải quyết: 1-2 ngày làm việc.\nLệ phí: Miễn phí.',
  'đăng ký kết hôn': 'Thủ tục đăng ký kết hôn:\n1. Tờ khai đăng ký kết hôn (theo mẫu)\n2. CMND/CCCD của hai bên\n3. Giấy xác nhận tình trạng hôn nhân\n\nThời gian: 3-5 ngày làm việc.\nLệ phí: Theo quy định.',
  'khai sinh': 'Thủ tục đăng ký khai sinh:\n1. Giấy chứng sinh (từ bệnh viện)\n2. CMND/CCCD của cha mẹ\n3. Sổ hộ khẩu\n4. Giấy đăng ký kết hôn (nếu có)\n\nThời gian: 1-2 ngày làm việc.\nLệ phí: Miễn phí.',
  'khai tử': 'Thủ tục đăng ký khai tử:\n1. Giấy báo tử hoặc giấy chứng tử\n2. CMND/CCCD người khai\n3. Sổ hộ khẩu\n\nThời gian: 1 ngày làm việc.\nLệ phí: Miễn phí.',
}

function findResponse(input: string): string {
  const normalized = input.toLowerCase().trim()

  for (const [key, response] of Object.entries(faqResponses)) {
    if (normalized.includes(key)) {
      return response
    }
  }

  // Default response
  return 'Xin lỗi, tôi chưa có thông tin về vấn đề này. Bạn có thể:\n\n1. Gọi điện: 0233.xxx.xxx\n2. Đến trực tiếp UBND xã\n3. Gửi yêu cầu qua mục "Gửi yêu cầu"\n\nHoặc thử hỏi về:\n- Giờ làm việc\n- Địa chỉ liên hệ\n- Xác nhận cư trú\n- Đăng ký kết hôn\n- Khai sinh, khai tử'
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý ảo của UBND xã Diên Sanh. Tôi có thể giúp bạn tìm hiểu về các thủ tục hành chính, giờ làm việc, và thông tin liên hệ. Bạn cần hỗ trợ gì?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500))

    const response = findResponse(input)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/portal" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Trợ lý ảo</h1>
              <p className="text-xs text-text-secondary">Hỗ trợ 24/7</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'assistant' ? 'bg-primary-100 text-primary-600' : 'bg-muted'
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                message.role === 'assistant'
                  ? 'bg-white border'
                  : 'bg-primary-600 text-white'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={cn(
                  'text-xs mt-1',
                  message.role === 'assistant' ? 'text-text-secondary' : 'text-primary-200'
                )}>
                  {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 px-4 py-3 rounded-full border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                'p-3 rounded-full transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-text-secondary text-center mt-2">
            Trợ lý ảo có thể mắc lỗi. Vui lòng xác minh thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  )
}
