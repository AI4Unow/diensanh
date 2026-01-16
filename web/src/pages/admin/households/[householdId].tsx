import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Users, Phone, MapPin, Edit2, Trash2, UserPlus, Calendar } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useHousehold, useDeleteHousehold } from '@/hooks/use-households'
import { useResidents, useDeleteResident } from '@/hooks/use-residents'
import { useVillage } from '@/hooks/use-villages'
import { cn } from '@/lib/utils'
import type { Resident } from '@/types'

export function HouseholdDetailPage() {
  const { villageId, householdId } = useParams<{ villageId: string; householdId: string }>()
  const navigate = useNavigate()
  const { data: household, isLoading } = useHousehold(villageId, householdId)
  const { data: village } = useVillage(villageId)
  const { data: residents } = useResidents(villageId, householdId)
  const deleteHousehold = useDeleteHousehold()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const basePath = `/admin/villages/${villageId}/households`

  const handleDelete = async () => {
    if (!householdId || !villageId) return
    try {
      await deleteHousehold.mutateAsync({ villageId, householdId })
      navigate(basePath)
    } catch (error) {
      console.error('Failed to delete household:', error)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  if (!household) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy hộ gia đình</p>
          <Link to={basePath} className="text-primary-600 hover:underline mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={basePath} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{household.headName}</h1>
            <p className="text-muted-foreground">{village?.name || 'Đang tải...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`${basePath}/${householdId}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Sửa</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Xóa</span>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Số hộ khẩu</div>
                <div className="font-semibold">{household.code}</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Nhân khẩu</div>
                <div className="font-semibold">{household.memberCount} người</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Điện thoại</div>
                <div className="font-semibold">{household.phone || 'Chưa có'}</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Địa chỉ</div>
                <div className="font-semibold truncate max-w-[150px]">{household.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Residents List */}
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Thành viên hộ gia đình</h2>
            <Link
              to={`${basePath}/${householdId}/residents/new`}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
              )}
            >
              <UserPlus className="w-4 h-4" />
              Thêm thành viên
            </Link>
          </div>
          <div className="divide-y">
            {residents?.map((resident) => (
              <ResidentRow
                key={resident.id}
                resident={resident}
                villageId={villageId!}
                householdId={householdId!}
                basePath={`${basePath}/${householdId}/residents`}
                isHead={resident.id === household.headId}
              />
            ))}
            {(!residents || residents.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có thành viên nào
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {household.notes && (
          <div className="bg-card rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Ghi chú</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{household.notes}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
            <p className="text-muted-foreground mb-4">
              Bạn có chắc muốn xóa hộ gia đình của <strong>{household.headName}</strong>?
              Tất cả thành viên trong hộ cũng sẽ bị xóa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-muted rounded-lg hover:bg-muted/80"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteHousehold.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteHousehold.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function ResidentRow({
  resident,
  villageId,
  householdId,
  basePath,
  isHead
}: {
  resident: Resident
  villageId: string
  householdId: string
  basePath: string
  isHead: boolean
}) {
  const deleteResident = useDeleteResident()
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteResident.mutateAsync({ villageId, householdId, residentId: resident.id })
      setShowDelete(false)
    } catch (error) {
      console.error('Failed to delete resident:', error)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
          isHead ? 'bg-primary-100 text-primary-700' : 'bg-muted'
        )}>
          {(resident.fullName || resident.name || '?').charAt(0)}
        </div>
        <div>
          <div className="font-medium flex items-center gap-2">
            {resident.fullName || resident.name}
            {isHead && (
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                Chủ hộ
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-3">
            <span>{resident.relationship}</span>
            {(resident.dateOfBirth || resident.birthDate) && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {resident.dateOfBirth
                  ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN')
                  : resident.birthDate
                    ? new Date(resident.birthDate).toLocaleDateString('vi-VN')
                    : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={`${basePath}/${resident.id}/edit`}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold mb-2">Xóa thành viên?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Xóa {resident.fullName || resident.name} khỏi hộ gia đình?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2 bg-muted rounded-lg">
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteResident.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
