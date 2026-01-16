# Phase 04: Village Management Module

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02: Firestore Schema](./phase-02-firestore-schema-security.md)
- [Phase 03: Dashboard](./phase-03-admin-dashboard-navigation.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 12h |
| Dependencies | Phase 01-03 complete |

Build village listing, detail view, and leader assignment for 18 thon + 2 KDC.

---

## Key Insights
- 3 regions for filtering: Dien Sanh cu (11), Hai Truong (5), Hai Dinh (4)
- Leader assignment requires user search/creation
- Village stats aggregate from households subcollection
- Read-only for village leaders (own village only)

---

## Requirements

### Functional
- FR1: List all villages with stats (admin)
- FR2: Filter by region (Dien Sanh cu, Hai Truong, Hai Dinh)
- FR3: View village details with household summary
- FR4: Assign/reassign village leader (admin)
- FR5: Village leader sees only their village

### Non-Functional
- NFR1: List loads <1s
- NFR2: Search filters instantly (client-side)
- NFR3: Works offline for cached villages

---

## Architecture

### Components
```
src/components/villages/
├── village-list.tsx           # Table/card list
├── village-card.tsx           # Village card component
├── village-detail.tsx         # Village detail view
├── village-stats.tsx          # Stats summary
├── leader-assignment.tsx      # Leader picker modal
├── region-filter.tsx          # Region filter buttons
└── village-search.tsx         # Search input

src/pages/admin/
├── villages/
│   ├── index.tsx              # List page
│   └── [villageId].tsx        # Detail page

src/pages/village/
└── index.tsx                  # Village leader dashboard
```

### Data Flow
```
VillagesPage
  → useVillages() hook (React Query)
    → Firestore /villages collection
    → Aggregate household counts
  → VillageList (filterable, searchable)
    → VillageCard
      → Click → VillageDetail
        → LeaderAssignment modal
```

---

## Related Code Files

### Create
- `src/components/villages/village-list.tsx`
- `src/components/villages/village-card.tsx`
- `src/components/villages/village-detail.tsx`
- `src/components/villages/village-stats.tsx`
- `src/components/villages/leader-assignment.tsx`
- `src/components/villages/region-filter.tsx`
- `src/pages/admin/villages/index.tsx`
- `src/pages/admin/villages/[villageId].tsx`
- `src/pages/village/index.tsx`
- `src/hooks/use-villages.ts`
- `src/hooks/use-village.ts`

### Modify
- `src/routes/index.tsx` - Add village routes

---

## Implementation Steps

### 1. Create useVillages Hook (1.5h)
```typescript
// src/hooks/use-villages.ts
export function useVillages(options?: { region?: string }) {
  const { db } = useFirestore()

  return useQuery({
    queryKey: ['villages', options?.region],
    queryFn: async () => {
      let q = collection(db, 'villages')

      if (options?.region) {
        q = query(q, where('region', '==', options.region))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Village[]
    },
    staleTime: 5 * 60 * 1000,
  })
}
```

### 2. Create useVillage Hook (1h)
```typescript
// src/hooks/use-village.ts
export function useVillage(villageId: string) {
  const { db } = useFirestore()

  const villageQuery = useQuery({
    queryKey: ['village', villageId],
    queryFn: async () => {
      const doc = await getDoc(doc(db, 'villages', villageId))
      return { id: doc.id, ...doc.data() } as Village
    },
  })

  const householdsQuery = useQuery({
    queryKey: ['village-households', villageId],
    queryFn: async () => {
      const snapshot = await getDocs(
        collection(db, 'villages', villageId, 'households')
      )
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    },
  })

  return { village: villageQuery, households: householdsQuery }
}
```

### 3. Create RegionFilter Component (1h)
```typescript
// src/components/villages/region-filter.tsx
const regions = [
  { value: '', label: 'Tất cả' },
  { value: 'dien_sanh_cu', label: 'Diên Sanh cũ' },
  { value: 'hai_truong', label: 'Hải Trường' },
  { value: 'hai_dinh', label: 'Hải Định' },
]

export function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div className="flex gap-2">
      {regions.map(region => (
        <button
          key={region.value}
          onClick={() => onChange(region.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm transition',
            value === region.value
              ? 'bg-primary text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          )}
        >
          {region.label}
        </button>
      ))}
    </div>
  )
}
```

### 4. Create VillageCard Component (1.5h)
```typescript
// src/components/villages/village-card.tsx
export function VillageCard({ village }: { village: Village }) {
  return (
    <Link
      to={`/admin/villages/${village.id}`}
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{village.name}</h3>
          <p className="text-sm text-gray-500">
            {village.type === 'thon' ? 'Thôn' : 'KDC'} • {regionLabels[village.region]}
          </p>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded text-xs',
          village.leaderId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        )}>
          {village.leaderId ? 'Có trưởng thôn' : 'Chưa có'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gray-400" />
          <span>{village.householdCount} hộ</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{village.residentCount} nhân khẩu</span>
        </div>
      </div>

      {village.leaderName && (
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          <span className="font-medium">Trưởng thôn:</span> {village.leaderName}
        </div>
      )}
    </Link>
  )
}
```

### 5. Create VillageList Component (1.5h)
```typescript
// src/components/villages/village-list.tsx
export function VillageList({ villages, loading }: VillageListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return villages
    const lower = search.toLowerCase()
    return villages.filter(v =>
      v.name.toLowerCase().includes(lower) ||
      v.leaderName?.toLowerCase().includes(lower)
    )
  }, [villages, search])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <VillageCardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Tìm kiếm thôn..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-80 px-4 py-2 border rounded-lg"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(village => (
          <VillageCard key={village.id} village={village} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Không tìm thấy thôn nào
        </p>
      )}
    </div>
  )
}
```

### 6. Create VillagesPage (1h)
```typescript
// src/pages/admin/villages/index.tsx
export function VillagesPage() {
  const [region, setRegion] = useState('')
  const { data: villages, isLoading } = useVillages({ region })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý thôn</h1>
      </div>

      <RegionFilter value={region} onChange={setRegion} />

      <VillageList villages={villages ?? []} loading={isLoading} />
    </div>
  )
}
```

### 7. Create VillageDetail Page (2h)
```typescript
// src/pages/admin/villages/[villageId].tsx
export function VillageDetailPage() {
  const { villageId } = useParams()
  const { village, households } = useVillage(villageId!)
  const [showLeaderModal, setShowLeaderModal] = useState(false)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Quản lý thôn', href: '/admin/villages' },
        { label: village.data?.name }
      ]} />

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{village.data?.name}</h1>
            <p className="text-gray-500">{regionLabels[village.data?.region]}</p>
          </div>
          <Button onClick={() => setShowLeaderModal(true)}>
            {village.data?.leaderId ? 'Đổi trưởng thôn' : 'Gán trưởng thôn'}
          </Button>
        </div>

        <VillageStats village={village.data} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Danh sách hộ gia đình</h2>
        <HouseholdTable households={households.data ?? []} />
      </div>

      <LeaderAssignmentModal
        open={showLeaderModal}
        onClose={() => setShowLeaderModal(false)}
        village={village.data}
      />
    </div>
  )
}
```

### 8. Create LeaderAssignment Modal (1.5h)
```typescript
// src/components/villages/leader-assignment.tsx
export function LeaderAssignmentModal({ open, onClose, village }: Props) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const { mutate: assignLeader, isPending } = useAssignLeader()

  const handleSubmit = () => {
    assignLeader({
      villageId: village.id,
      phone,
      name,
    }, {
      onSuccess: () => onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán trưởng thôn - {village?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Họ tên</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 9. Village Leader Dashboard (1h)
For village leaders - simplified view of their village only.

---

## Todo List
- [ ] Create useVillages hook
- [ ] Create useVillage hook
- [ ] Create RegionFilter component
- [ ] Create VillageCard component
- [ ] Create VillageList with search
- [ ] Create VillagesPage
- [ ] Create VillageDetailPage
- [ ] Create LeaderAssignment modal
- [ ] Create useAssignLeader mutation
- [ ] Create VillageLeaderDashboard
- [ ] Add routes for village pages
- [ ] Test filtering and search
- [ ] Test leader assignment flow
- [ ] Test village leader access

---

## Success Criteria
- [ ] All 20 villages display correctly
- [ ] Region filter works
- [ ] Search filters by name/leader
- [ ] Leader assignment updates Firestore
- [ ] Village leader sees only their village
- [ ] Offline displays cached villages

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing village data | Medium | Seed script with all 20 villages |
| Leader reassignment issues | Low | Confirm dialog, audit log |
| Large household lists | Medium | Pagination, virtual scroll |

---

## Security Considerations
- Validate admin role before leader assignment
- Log leader changes for audit
- Village leaders cannot modify village metadata

---

## Next Steps
After completion:
1. → Phase 05: Household & Resident Management
2. Import real village leader data
3. Test with commune admin
