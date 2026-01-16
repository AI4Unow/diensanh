import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Home, Phone, Edit2, UserPlus } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useVillage } from '@/hooks/use-villages'
import { useHouseholds } from '@/hooks/use-households'
import type { VillageRegion } from '@/types'

const regionLabels: Record<VillageRegion, string> = {
  dien_sanh_cu: 'Diên Sanh cũ',
  hai_truong: 'Hải Trường',
  hai_dinh: 'Hải Định',
}

export function VillageDetailPage() {
  const { villageId } = useParams<{ villageId: string }>()
  const { data: village, isLoading } = useVillage(villageId)
  const { data: households } = useHouseholds(villageId)
  const [showLeaderModal, setShowLeaderModal] = useState(false)

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

  if (!village) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy thôn</p>
          <Link to="/admin/villages" className="text-primary-600 hover:underline mt-2 inline-block">
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
          <Link
            to="/admin/villages"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{village.name}</h1>
            <p className="text-muted-foreground">{regionLabels[village.region]}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{village.householdCount}</div>
                <div className="text-sm text-muted-foreground">Hộ gia đình</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{village.residentCount}</div>
                <div className="text-sm text-muted-foreground">Nhân khẩu</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {village.householdCount > 0
                    ? (village.residentCount / village.householdCount).toFixed(1)
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Người/hộ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leader Info */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Trưởng thôn</h2>
            <button
              onClick={() => setShowLeaderModal(true)}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
            >
              {village.leaderId ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {village.leaderId ? 'Thay đổi' : 'Chỉ định'}
            </button>
          </div>
          {village.leaderName ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">{village.leaderName}</div>
                {village.leaderPhone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {village.leaderPhone}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Chưa có trưởng thôn</p>
          )}
        </div>

        {/* Households Preview */}
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Hộ gia đình</h2>
            <Link
              to={`/admin/villages/${villageId}/households`}
              className="text-sm text-primary-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y">
            {households?.slice(0, 5).map((household) => (
              <Link
                key={household.id}
                to={`/admin/villages/${villageId}/households/${household.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{household.headName}</div>
                  <div className="text-sm text-muted-foreground">{household.address}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {household.memberCount} người
                </div>
              </Link>
            ))}
            {(!households || households.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có hộ gia đình nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leader Assignment Modal - TODO: Implement */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Chỉ định trưởng thôn</h3>
            <p className="text-muted-foreground mb-4">
              Tính năng đang được phát triển...
            </p>
            <button
              onClick={() => setShowLeaderModal(false)}
              className="w-full py-2 bg-muted rounded-lg hover:bg-muted/80"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
