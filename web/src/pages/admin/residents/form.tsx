import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useResident, useCreateResident, useUpdateResident } from '@/hooks/use-residents'
import { useHousehold } from '@/hooks/use-households'
import { cn } from '@/lib/utils'
import type { Gender } from '@/types'

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

const relationshipOptions = [
  'Chủ hộ',
  'Vợ/Chồng',
  'Con',
  'Cha/Mẹ',
  'Ông/Bà',
  'Cháu',
  'Anh/Chị/Em',
  'Khác',
]

export function ResidentFormPage() {
  const { villageId, householdId, residentId } = useParams<{
    villageId: string
    householdId: string
    residentId?: string
  }>()
  const navigate = useNavigate()
  const isEditing = !!residentId

  const { data: resident, isLoading: loadingResident } = useResident(villageId, householdId, residentId)
  const { data: household } = useHousehold(villageId, householdId)
  const createResident = useCreateResident()
  const updateResident = useUpdateResident()

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male' as Gender,
    idNumber: '',
    phone: '',
    relationship: 'Chủ hộ',
    occupation: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (resident && isEditing) {
      setFormData({
        fullName: resident.fullName || resident.name || '',
        dateOfBirth: resident.dateOfBirth || (resident.birthDate ? new Date(resident.birthDate).toISOString().split('T')[0] : ''),
        gender: resident.gender,
        idNumber: '',
        phone: resident.phone || '',
        relationship: resident.relationship || 'Khác',
        occupation: resident.occupation || '',
        notes: resident.notes || '',
      })
    }
  }, [resident, isEditing])

  const basePath = `/admin/villages/${villageId}/households/${householdId}`

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh'
    if (!formData.relationship) newErrors.relationship = 'Vui lòng chọn quan hệ với chủ hộ'
    if (!isEditing && !formData.idNumber.trim()) newErrors.idNumber = 'Vui lòng nhập số CCCD'
    if (formData.idNumber && !/^\d{12}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'Số CCCD phải có 12 chữ số'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !villageId || !householdId) return

    try {
      const data = {
        name: formData.fullName,
        fullName: formData.fullName,
        birthDate: new Date(formData.dateOfBirth),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        relationship: formData.relationship,
        occupation: formData.occupation,
        notes: formData.notes,
        isHead: formData.relationship === 'Chủ hộ',
        villageId,
        householdId,
        ...(formData.idNumber ? { idNumber: formData.idNumber } : {}),
      }

      if (isEditing && residentId) {
        await updateResident.mutateAsync({ ...data, id: residentId })
      } else {
        await createResident.mutateAsync(data)
      }
      navigate(basePath)
    } catch (error) {
      console.error('Failed to save resident:', error)
    }
  }

  const isPending = createResident.isPending || updateResident.isPending

  if (isEditing && loadingResident) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={basePath} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Sửa thông tin nhân khẩu' : 'Thêm nhân khẩu mới'}
            </h1>
            {household && (
              <p className="text-muted-foreground">Hộ: {household.headName}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{isEditing ? 'Cập nhật' : 'Lưu'}</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.fullName && 'border-red-500'
              )}
            />
            {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Date of Birth & Gender */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.dateOfBirth && 'border-red-500'
                )}
              />
              {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CCCD */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Số CCCD {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, '') })}
              placeholder={isEditing ? 'Để trống nếu không thay đổi' : '001234567890'}
              maxLength={12}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.idNumber && 'border-red-500'
              )}
            />
            {errors.idNumber && <p className="text-sm text-red-500 mt-1">{errors.idNumber}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Số CCCD sẽ được mã hóa để bảo mật
            </p>
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Quan hệ với chủ hộ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.relationship && 'border-red-500'
              )}
            >
              {relationshipOptions.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
            {errors.relationship && <p className="text-sm text-red-500 mt-1">{errors.relationship}</p>}
          </div>

          {/* Phone & Occupation */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nghề nghiệp</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Nông dân, Công nhân..."
                className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Ghi chú thêm..."
              className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
