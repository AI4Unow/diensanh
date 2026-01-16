import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useHousehold, useCreateHousehold, useUpdateHousehold } from '@/hooks/use-households'
import { useVillage } from '@/hooks/use-villages'
import { cn } from '@/lib/utils'

export function HouseholdFormPage() {
  const { villageId, householdId } = useParams<{ villageId: string; householdId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!householdId

  const { data: household, isLoading: loadingHousehold } = useHousehold(villageId, householdId)
  const { data: village } = useVillage(villageId)
  const createHousehold = useCreateHousehold()
  const updateHousehold = useUpdateHousehold()

  const [formData, setFormData] = useState({
    code: '',
    headName: '',
    address: '',
    phone: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (household && isEditing) {
      setFormData({
        code: household.code,
        headName: household.headName,
        address: household.address,
        phone: household.phone || '',
        notes: household.notes || '',
      })
    }
  }, [household, isEditing])

  const basePath = `/admin/villages/${villageId}/households`

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.code.trim()) newErrors.code = 'Vui lòng nhập số hộ khẩu'
    if (!formData.headName.trim()) newErrors.headName = 'Vui lòng nhập tên chủ hộ'
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !villageId) return

    try {
      if (isEditing && householdId) {
        await updateHousehold.mutateAsync({
          villageId,
          id: householdId,
          ...formData,
        })
        navigate(`${basePath}/${householdId}`)
      } else {
        const newId = await createHousehold.mutateAsync({
          villageId,
          ...formData,
          memberCount: 0,
        })
        navigate(`${basePath}/${newId}`)
      }
    } catch (error) {
      console.error('Failed to save household:', error)
    }
  }

  const isPending = createHousehold.isPending || updateHousehold.isPending

  if (isEditing && loadingHousehold) {
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
              {isEditing ? 'Sửa hộ gia đình' : 'Thêm hộ gia đình mới'}
            </h1>
            {village && (
              <p className="text-muted-foreground">{village.name}</p>
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
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isEditing ? 'Cập nhật' : 'Lưu'}</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border p-6 space-y-5">
          {/* Household Code */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Số hộ khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="VD: 001/2024"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.code && 'border-red-500'
              )}
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code}</p>
            )}
          </div>

          {/* Head Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tên chủ hộ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.headName}
              onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.headName && 'border-red-500'
              )}
            />
            {errors.headName && (
              <p className="text-sm text-red-500 mt-1">{errors.headName}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Số nhà, đường, thôn..."
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.address && 'border-red-500'
              )}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Phone */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Ghi chú thêm về hộ gia đình..."
              className="w-full px-3 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
