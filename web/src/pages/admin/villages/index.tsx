import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Home, Search, ChevronRight } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useVillages } from '@/hooks/use-villages'
import { cn } from '@/lib/utils'
import type { Village, VillageRegion } from '@/types'

const regionLabels: Record<VillageRegion, string> = {
  dien_sanh_cu: 'Diên Sanh cũ',
  hai_truong: 'Hải Trường',
  hai_dinh: 'Hải Định',
}

const regionColors: Record<VillageRegion, string> = {
  dien_sanh_cu: 'bg-blue-100 text-blue-700',
  hai_truong: 'bg-green-100 text-green-700',
  hai_dinh: 'bg-purple-100 text-purple-700',
}

export function VillagesPage() {
  const { data: villages, isLoading } = useVillages()
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<VillageRegion | 'all'>('all')

  // Filter villages
  const filteredVillages = villages?.filter((village) => {
    const matchesSearch = village.name.toLowerCase().includes(search.toLowerCase()) ||
      village.code.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = regionFilter === 'all' || village.region === regionFilter
    return matchesSearch && matchesRegion
  })

  // Group by region for stats
  const regionStats = villages?.reduce((acc, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý thôn</h1>
            <p className="text-muted-foreground">
              {villages?.length || 0} thôn/KDC
            </p>
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRegionFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              regionFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            Tất cả ({villages?.length || 0})
          </button>
          {(['dien_sanh_cu', 'hai_truong', 'hai_dinh'] as VillageRegion[]).map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                regionFilter === region
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {regionLabels[region]} ({regionStats?.[region] || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm thôn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Village Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border p-5 animate-pulse">
                <div className="h-5 w-32 bg-muted rounded mb-3" />
                <div className="h-4 w-20 bg-muted rounded mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVillages?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy thôn nào
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVillages?.map((village) => (
              <VillageCard key={village.id} village={village} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function VillageCard({ village }: { village: Village }) {
  return (
    <Link
      to={`/admin/villages/${village.id}`}
      className="bg-card rounded-xl border p-5 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{village.name}</h3>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              regionColors[village.region]
            )}>
              {regionLabels[village.region]}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-600 transition-colors" />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Home className="w-4 h-4" />
          <span>{village.householdCount} hộ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{village.residentCount} người</span>
        </div>
      </div>

      {village.leaderName && (
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="text-muted-foreground">Trưởng thôn: </span>
          <span className="font-medium">{village.leaderName}</span>
        </div>
      )}
    </Link>
  )
}
