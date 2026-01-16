# Phase 05: Household & Resident Management

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02: Firestore Schema](./phase-02-firestore-schema-security.md)
- [Phase 04: Village Management](./phase-04-village-management.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 16h |
| Dependencies | Phase 04 complete |

Full CRUD for households and residents per village with offline support.

---

## Key Insights
- Subcollection path: /villages/{villageId}/households/{householdId}/residents/{residentId}
- Offline writes queue automatically with Firestore
- Bulk import needed for initial data migration
- CCCD (national ID) is sensitive - handle carefully

---

## Requirements

### Functional
- FR1: List households per village (paginated)
- FR2: Add/edit/delete household
- FR3: List residents per household
- FR4: Add/edit/delete resident
- FR5: Search households by head name, code
- FR6: Bulk import from Excel/CSV
- FR7: Export household data

### Non-Functional
- NFR1: Support 500+ households per village
- NFR2: Offline CRUD with sync indicator
- NFR3: Form validation before submit

---

## Architecture

### Components
```
src/components/households/
├── household-table.tsx        # Paginated table
├── household-row.tsx          # Table row
├── household-form.tsx         # Add/edit form
├── household-detail.tsx       # Detail panel
├── household-search.tsx       # Search/filter
├── household-import.tsx       # Bulk import modal
└── household-export.tsx       # Export button

src/components/residents/
├── resident-list.tsx          # Resident list
├── resident-card.tsx          # Resident card
├── resident-form.tsx          # Add/edit form
└── relationship-select.tsx    # Relationship dropdown

src/pages/admin/households/
├── index.tsx                  # Global household view
└── [householdId].tsx          # Household detail

src/pages/village/households/
├── index.tsx                  # Village-scoped list
└── [householdId].tsx          # Household detail
```

### Form Fields - Household
```typescript
interface HouseholdFormData {
  code: string          // So ho khau (required)
  headName: string      // Ho ten chu ho (required)
  headPhone?: string    // SDT chu ho
  address: string       // Dia chi (required)
}
```

### Form Fields - Resident
```typescript
interface ResidentFormData {
  name: string                     // Ho ten (required)
  birthDate?: Date                 // Ngay sinh
  gender: 'male' | 'female'        // Gioi tinh (required)
  idNumber?: string                // CCCD
  phone?: string                   // SDT
  relationship: string             // Quan he voi chu ho (required)
  isHead: boolean                  // La chu ho
}

const relationships = [
  'Chủ hộ',
  'Vợ/Chồng',
  'Con',
  'Bố/Mẹ',
  'Ông/Bà',
  'Anh/Chị/Em',
  'Cháu',
  'Khác'
]
```

---

## Related Code Files

### Create
- `src/components/households/household-table.tsx`
- `src/components/households/household-form.tsx`
- `src/components/households/household-detail.tsx`
- `src/components/households/household-search.tsx`
- `src/components/households/household-import.tsx`
- `src/components/residents/resident-list.tsx`
- `src/components/residents/resident-form.tsx`
- `src/pages/admin/households/index.tsx`
- `src/pages/admin/households/[householdId].tsx`
- `src/pages/village/households/index.tsx`
- `src/hooks/use-households.ts`
- `src/hooks/use-household.ts`
- `src/hooks/use-residents.ts`
- `src/lib/import-export.ts`

---

## Implementation Steps

### 1. Create useHouseholds Hook (1.5h)
```typescript
// src/hooks/use-households.ts
export function useHouseholds(villageId: string, options?: { search?: string; limit?: number }) {
  const { db } = useFirestore()

  return useQuery({
    queryKey: ['households', villageId, options],
    queryFn: async () => {
      const householdsRef = collection(db, 'villages', villageId, 'households')
      let q = query(householdsRef, orderBy('headName'), limit(options?.limit ?? 50))

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Household[]
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Mutations
export function useCreateHousehold(villageId: string) {
  const { db } = useFirestore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: HouseholdFormData) => {
      const householdsRef = collection(db, 'villages', villageId, 'households')
      const docRef = await addDoc(householdsRef, {
        ...data,
        memberCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', villageId] })
      queryClient.invalidateQueries({ queryKey: ['village', villageId] })
    }
  })
}
```

### 2. Create HouseholdTable Component (2h)
```typescript
// src/components/households/household-table.tsx
export function HouseholdTable({ households, villageId, loading }: Props) {
  if (loading) return <TableSkeleton rows={10} cols={5} />

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left p-3">Số hộ khẩu</th>
          <th className="text-left p-3">Chủ hộ</th>
          <th className="text-left p-3">Địa chỉ</th>
          <th className="text-center p-3">Số nhân khẩu</th>
          <th className="text-right p-3">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {households.map(household => (
          <HouseholdRow
            key={household.id}
            household={household}
            villageId={villageId}
          />
        ))}
      </tbody>
    </table>
  )
}
```

### 3. Create HouseholdForm Component (2h)
```typescript
// src/components/households/household-form.tsx
export function HouseholdForm({ villageId, household, onSuccess }: Props) {
  const isEdit = !!household
  const createMutation = useCreateHousehold(villageId)
  const updateMutation = useUpdateHousehold(villageId, household?.id)

  const form = useForm<HouseholdFormData>({
    defaultValues: household ?? {
      code: '',
      headName: '',
      headPhone: '',
      address: '',
    }
  })

  const onSubmit = (data: HouseholdFormData) => {
    const mutation = isEdit ? updateMutation : createMutation
    mutation.mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Số hộ khẩu *</Label>
        <Input
          {...form.register('code', { required: 'Bắt buộc' })}
          placeholder="VD: HK-001"
        />
        {form.formState.errors.code && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="headName">Họ tên chủ hộ *</Label>
        <Input {...form.register('headName', { required: 'Bắt buộc' })} />
      </div>

      <div>
        <Label htmlFor="headPhone">Số điện thoại</Label>
        <Input {...form.register('headPhone')} placeholder="0912345678" />
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ *</Label>
        <Textarea {...form.register('address', { required: 'Bắt buộc' })} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  )
}
```

### 4. Create useResidents Hook (1h)
```typescript
// src/hooks/use-residents.ts
export function useResidents(villageId: string, householdId: string) {
  const { db } = useFirestore()

  return useQuery({
    queryKey: ['residents', villageId, householdId],
    queryFn: async () => {
      const residentsRef = collection(
        db, 'villages', villageId, 'households', householdId, 'residents'
      )
      const snapshot = await getDocs(query(residentsRef, orderBy('isHead', 'desc')))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resident[]
    }
  })
}
```

### 5. Create ResidentList Component (1.5h)
```typescript
// src/components/residents/resident-list.tsx
export function ResidentList({ residents, villageId, householdId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const deleteMutation = useDeleteResident(villageId, householdId)

  return (
    <div className="space-y-2">
      {residents.map(resident => (
        <div
          key={resident.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <div className="font-medium">
              {resident.name}
              {resident.isHead && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Chủ hộ
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {resident.relationship} • {resident.gender === 'male' ? 'Nam' : 'Nữ'}
              {resident.birthDate && ` • ${formatDate(resident.birthDate)}`}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditingId(resident.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm('Xác nhận xóa?')) deleteMutation.mutate(resident.id)
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 6. Create ResidentForm Component (2h)
With relationship dropdown, date picker, gender select.

### 7. Create HouseholdDetail Page (2h)
```typescript
// src/pages/admin/households/[householdId].tsx
export function HouseholdDetailPage() {
  const { villageId, householdId } = useParams()
  const { data: household } = useHousehold(villageId!, householdId!)
  const { data: residents } = useResidents(villageId!, householdId!)
  const [showAddResident, setShowAddResident] = useState(false)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Quản lý thôn', href: '/admin/villages' },
        { label: household?.headName, href: `/admin/villages/${villageId}` },
        { label: `Hộ ${household?.code}` }
      ]} />

      {/* Household Info Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">Hộ {household?.code}</h1>
            <p className="text-gray-500">{household?.address}</p>
          </div>
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            Sửa thông tin
          </Button>
        </div>
      </div>

      {/* Residents Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Nhân khẩu ({residents?.length ?? 0})
          </h2>
          <Button onClick={() => setShowAddResident(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân khẩu
          </Button>
        </div>

        <ResidentList
          residents={residents ?? []}
          villageId={villageId!}
          householdId={householdId!}
        />
      </div>

      <ResidentFormModal
        open={showAddResident}
        onClose={() => setShowAddResident(false)}
        villageId={villageId!}
        householdId={householdId!}
      />
    </div>
  )
}
```

### 8. Create Import/Export Utilities (2h)
```typescript
// src/lib/import-export.ts
import * as XLSX from 'xlsx'

export async function importHouseholdsFromExcel(file: File): Promise<HouseholdImportRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<HouseholdImportRow>(sheet)
  return data
}

export function exportHouseholdsToExcel(households: Household[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(households)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Households')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
```

### 9. Create Import Modal (1.5h)
Preview imported data, validate, batch insert.

### 10. Add Sync Status Indicator (0.5h)
Show pending writes count and sync status.

---

## Todo List
- [ ] Install react-hook-form, xlsx dependencies
- [ ] Create useHouseholds hook with mutations
- [ ] Create useResidents hook with mutations
- [ ] Create HouseholdTable component
- [ ] Create HouseholdForm component
- [ ] Create HouseholdDetail page
- [ ] Create ResidentList component
- [ ] Create ResidentForm with relationship select
- [ ] Create import/export utilities
- [ ] Create HouseholdImport modal
- [ ] Add export button
- [ ] Add sync status indicator
- [ ] Test offline CRUD
- [ ] Test bulk import

---

## Success Criteria
- [ ] CRUD operations work for households
- [ ] CRUD operations work for residents
- [ ] Search filters correctly
- [ ] Excel import works (100+ rows)
- [ ] Export generates valid Excel file
- [ ] Offline writes sync when online
- [ ] Form validation prevents bad data

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large import fails | High | Batch in chunks of 500 |
| Data format mismatch | Medium | Validate before import, show preview |
| Offline conflict | Low | Last-write-wins, warn user |

---

## Security Considerations
- CCCD should be encrypted at rest (future)
- Validate phone format server-side
- Audit log for resident data changes
- No bulk export of CCCD numbers

---

## Next Steps
After completion:
1. → Phase 06: SMS Messaging System
2. Import commune's existing household data
3. Train village leaders on data entry
