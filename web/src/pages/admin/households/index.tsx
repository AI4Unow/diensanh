import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, Search, Home, Users, ChevronRight, ArrowLeft } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useHouseholds } from '@/hooks/use-households'
import { useVillage } from '@/hooks/use-villages'
import { cn } from '@/lib/utils'
import type { Household } from '@/types'

export function HouseholdsPage() {
  const { villageId } = useParams<{ villageId: string }>()
  const { data: village } = useVillage(villageId)
  const { data: households, isLoading } = useHouseholds(villageId)
  const [search, setSearch] = useState('')

  // Filter households
  const filteredHouseholds = households?.filter((h) =>
    h.headName.toLowerCase().includes(search.toLowerCase()) ||
    h.code.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {villageId && (
            <Link
              to={`/admin/villages/${villageId}`}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Hộ gia đình</h1>
            {village && (
              <p className="text-muted-foreground">{village.name}</p>
            )}
          </div>
          <Link
            to={villageId ? `/admin/villages/${villageId}/households/new` : '/admin/households/new'}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm hộ</span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên chủ hộ, số hộ khẩu, địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Households Table */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Chủ hộ</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">Số hộ khẩu</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">Địa chỉ</th>
                  <th className="text-center px-4 py-3 text-sm font-medium">Nhân khẩu</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-5 w-32 bg-muted rounded" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-5 w-24 bg-muted rounded" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-5 w-40 bg-muted rounded" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-8 bg-muted rounded mx-auto" /></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                ) : filteredHouseholds?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      {search ? 'Không tìm thấy hộ gia đình nào' : 'Chưa có hộ gia đình nào'}
                    </td>
                  </tr>
                ) : (
                  filteredHouseholds?.map((household) => (
                    <HouseholdRow key={household.id} household={household} villageId={villageId} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function HouseholdRow({ household, villageId }: { household: Household; villageId?: string }) {
  const basePath = villageId ? `/admin/villages/${villageId}/households` : '/admin/households'

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{household.headName}</div>
            <div className="text-sm text-muted-foreground sm:hidden">{household.code}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
        {household.code}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
        {household.address}
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{household.memberCount}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Link
          to={`${basePath}/${household.id}`}
          className="p-2 hover:bg-muted rounded-lg inline-flex"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </td>
    </tr>
  )
}
