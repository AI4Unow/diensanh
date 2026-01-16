import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { cn } from '@/lib/utils'
import type { RequestType } from '@/types'

const requestTypes: { value: RequestType; label: string; description: string }[] = [
  { value: 'certificate', label: 'Xin giấy xác nhận', description: 'Xác nhận cư trú, hộ khẩu, tình trạng hôn nhân...' },
  { value: 'complaint', label: 'Khiếu nại', description: 'Khiếu nại về quyết định hành chính...' },
  { value: 'suggestion', label: 'Kiến nghị', description: 'Đề xuất, góp ý về các vấn đề địa phương...' },
  { value: 'other', label: 'Khác', description: 'Các yêu cầu khác...' },
]

export function RequestFormPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'certificate' as RequestType,
    title: '',
    content: '',
    submitterName: '',
    submitterPhone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề'
    if (!formData.content.trim()) newErrors.content = 'Vui lòng nhập nội dung'
    if (!formData.submitterName.trim()) newErrors.submitterName = 'Vui lòng nhập họ tên'
    if (!formData.submitterPhone.trim()) newErrors.submitterPhone = 'Vui lòng nhập số điện thoại'
    if (formData.submitterPhone && !/^0[0-9]{9}$/.test(formData.submitterPhone)) {
      newErrors.submitterPhone = 'Số điện thoại không hợp lệ'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        status: 'pending',
        submittedBy: formData.submitterPhone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit request:', error)
      alert('Gửi yêu cầu thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Gửi yêu cầu thành công!</h2>
          <p className="text-muted-foreground mb-6">
            Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ qua số điện thoại {formData.submitterPhone}.
          </p>
          <div className="flex gap-3">
            <Link
              to="/portal"
              className="flex-1 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              Về trang chủ
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({ type: 'certificate', title: '', content: '', submitterName: '', submitterPhone: '' })
              }}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/portal" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Gửi yêu cầu</h1>
            <p className="text-xs text-muted-foreground">UBND Xã Diên Sanh</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Request Type */}
        <div className="bg-white rounded-xl border p-5">
          <label className="block text-sm font-medium mb-3">Loại yêu cầu</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {requestTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={cn(
                  'p-4 rounded-lg border text-left transition-colors',
                  formData.type === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-medium">Nội dung yêu cầu</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Xin giấy xác nhận cư trú"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.title && 'border-red-500'
              )}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              placeholder="Mô tả chi tiết yêu cầu của bạn..."
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.content && 'border-red-500'
              )}
            />
            {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-medium">Thông tin liên hệ</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.submitterName}
              onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.submitterName && 'border-red-500'
              )}
            />
            {errors.submitterName && <p className="text-sm text-red-500 mt-1">{errors.submitterName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.submitterPhone}
              onChange={(e) => setFormData({ ...formData, submitterPhone: e.target.value.replace(/\D/g, '') })}
              placeholder="0912345678"
              maxLength={10}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.submitterPhone && 'border-red-500'
              )}
            />
            {errors.submitterPhone && <p className="text-sm text-red-500 mt-1">{errors.submitterPhone}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Chúng tôi sẽ liên hệ qua số này để thông báo kết quả
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-lg',
            'bg-primary-600 text-white hover:bg-primary-700 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          Gửi yêu cầu
        </button>
      </form>
    </div>
  )
}
