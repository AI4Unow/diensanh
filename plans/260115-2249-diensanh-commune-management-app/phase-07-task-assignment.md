# Phase 07: Task Assignment Module

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02: Firestore Schema](./phase-02-firestore-schema-security.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 10h |
| Dependencies | Phase 04 complete |

Task management for commune admin to assign tasks to village leaders, track completion.

---

## Key Insights
- Tasks assigned to villages, not individuals
- Village leaders submit reports (text + attachments)
- Admin tracks overall completion
- Push notifications for new tasks (future)

---

## Requirements

### Functional
- FR1: Create tasks with title, description, type, priority, due date
- FR2: Assign to one or multiple villages
- FR3: Village leader views assigned tasks
- FR4: Village leader submits completion report
- FR5: Admin views all tasks with status
- FR6: Filter tasks by status, village, date

### Non-Functional
- NFR1: Task list loads <1s
- NFR2: Works offline (view cached tasks)
- NFR3: Notifications for new tasks (future)

---

## Architecture

### Task Types
```typescript
const taskTypes = [
  { value: 'survey', label: 'Khảo sát' },
  { value: 'notification', label: 'Thông báo' },
  { value: 'report', label: 'Báo cáo' },
  { value: 'meeting', label: 'Họp' },
  { value: 'other', label: 'Khác' }
]
```

### Task Status Flow
```
pending → in_progress → completed
                     ↘ cancelled
```

### Components
```
src/components/tasks/
├── task-list.tsx              # Task list view
├── task-card.tsx              # Task card
├── task-form.tsx              # Create/edit form
├── task-detail.tsx            # Detail view
├── task-filters.tsx           # Filter controls
├── village-selector.tsx       # Multi-select villages
├── report-form.tsx            # Submit report form
└── report-list.tsx            # View reports

src/pages/admin/tasks/
├── index.tsx                  # All tasks
├── create.tsx                 # Create task
└── [taskId].tsx               # Task detail

src/pages/village/tasks/
├── index.tsx                  # Assigned tasks
└── [taskId].tsx               # Task detail + report
```

---

## Related Code Files

### Create
- `src/components/tasks/task-list.tsx`
- `src/components/tasks/task-card.tsx`
- `src/components/tasks/task-form.tsx`
- `src/components/tasks/task-detail.tsx`
- `src/components/tasks/task-filters.tsx`
- `src/components/tasks/village-selector.tsx`
- `src/components/tasks/report-form.tsx`
- `src/components/tasks/report-list.tsx`
- `src/pages/admin/tasks/index.tsx`
- `src/pages/admin/tasks/create.tsx`
- `src/pages/admin/tasks/[taskId].tsx`
- `src/pages/village/tasks/index.tsx`
- `src/pages/village/tasks/[taskId].tsx`
- `src/hooks/use-tasks.ts`
- `src/hooks/use-task.ts`
- `src/hooks/use-task-reports.ts`

---

## Implementation Steps

### 1. Create useTasks Hook (1h)
```typescript
// src/hooks/use-tasks.ts
export function useTasks(options?: {
  status?: string
  villageId?: string
  limit?: number
}) {
  const { db } = useFirestore()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tasks', options],
    queryFn: async () => {
      let q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc'),
        limit(options?.limit ?? 50)
      )

      if (options?.status) {
        q = query(q, where('status', '==', options.status))
      }

      // Village leader: filter by assigned village
      if (user?.role === 'village_leader' && user.villageId) {
        q = query(q, where('assignedTo', 'array-contains', user.villageId))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
    }
  })
}
```

### 2. Create TaskForm Component (2h)
```typescript
// src/components/tasks/task-form.tsx
export function TaskForm({ task, onSuccess }: Props) {
  const isEdit = !!task
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask(task?.id)
  const { data: villages } = useVillages()

  const form = useForm<TaskFormData>({
    defaultValues: task ?? {
      title: '',
      description: '',
      type: 'notification',
      priority: 'medium',
      assignedTo: [],
      dueDate: null,
    }
  })

  const onSubmit = (data: TaskFormData) => {
    const mutation = isEdit ? updateMutation : createMutation
    mutation.mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Tiêu đề *</Label>
        <Input {...form.register('title', { required: true })} />
      </div>

      <div>
        <Label>Mô tả</Label>
        <Textarea {...form.register('description')} rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Loại công việc</Label>
          <Select {...form.register('type')}>
            {taskTypes.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Label>Mức độ ưu tiên</Label>
          <Select {...form.register('priority')}>
            <SelectItem value="low">Thấp</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
          </Select>
        </div>
      </div>

      <div>
        <Label>Gán cho thôn *</Label>
        <VillageSelector
          villages={villages ?? []}
          value={form.watch('assignedTo')}
          onChange={val => form.setValue('assignedTo', val)}
        />
      </div>

      <div>
        <Label>Hạn hoàn thành</Label>
        <DatePicker
          value={form.watch('dueDate')}
          onChange={val => form.setValue('dueDate', val)}
        />
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {isEdit ? 'Cập nhật' : 'Tạo công việc'}
      </Button>
    </form>
  )
}
```

### 3. Create VillageSelector Component (1h)
```typescript
// src/components/tasks/village-selector.tsx
export function VillageSelector({ villages, value, onChange }: Props) {
  const toggleVillage = (villageId: string) => {
    if (value.includes(villageId)) {
      onChange(value.filter(v => v !== villageId))
    } else {
      onChange([...value, villageId])
    }
  }

  const selectAll = () => onChange(villages.map(v => v.id))
  const clearAll = () => onChange([])

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>Chọn tất cả</Button>
        <Button variant="outline" size="sm" onClick={clearAll}>Bỏ chọn</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-auto p-2 border rounded">
        {villages.map(village => (
          <label
            key={village.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded cursor-pointer',
              value.includes(village.id) ? 'bg-primary/10' : 'hover:bg-gray-50'
            )}
          >
            <Checkbox
              checked={value.includes(village.id)}
              onCheckedChange={() => toggleVillage(village.id)}
            />
            <span className="text-sm">{village.name}</span>
          </label>
        ))}
      </div>

      <p className="text-sm text-gray-500">Đã chọn: {value.length} thôn</p>
    </div>
  )
}
```

### 4. Create TaskCard Component (1h)
```typescript
// src/components/tasks/task-card.tsx
export function TaskCard({ task }: { task: Task }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <Link
      to={`/admin/tasks/${task.id}`}
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{task.title}</h3>
        <span className={cn('px-2 py-0.5 rounded text-xs', priorityColors[task.priority])}>
          {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className={cn('px-2 py-0.5 rounded text-xs', statusColors[task.status])}>
          {statusLabels[task.status]}
        </span>

        {task.dueDate && (
          <span className="text-xs text-gray-500">
            Hạn: {format(task.dueDate.toDate(), 'dd/MM/yyyy')}
          </span>
        )}
      </div>
    </Link>
  )
}
```

### 5. Create TasksPage (Admin) (1h)
```typescript
// src/pages/admin/tasks/index.tsx
export function AdminTasksPage() {
  const [status, setStatus] = useState('')
  const { data: tasks, isLoading } = useTasks({ status })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý công việc</h1>
        <Button asChild>
          <Link to="/admin/tasks/create">
            <Plus className="h-4 w-4 mr-2" />
            Tạo công việc
          </Link>
        </Button>
      </div>

      <TaskFilters status={status} onStatusChange={setStatus} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks?.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  )
}
```

### 6. Create ReportForm Component (1.5h)
```typescript
// src/components/tasks/report-form.tsx
export function ReportForm({ taskId, villageId }: Props) {
  const { mutate: submitReport, isPending } = useSubmitReport(taskId)
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    submitReport({ villageId, content }, {
      onSuccess: () => {
        setContent('')
        toast.success('Đã gửi báo cáo')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Nội dung báo cáo</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Mô tả kết quả thực hiện..."
          rows={4}
        />
      </div>

      <Button onClick={handleSubmit} disabled={!content || isPending}>
        {isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
      </Button>
    </div>
  )
}
```

### 7. Create VillageTasks Page (1h)
For village leaders - view assigned tasks, submit reports.

### 8. Create TaskDetail Page (1.5h)
Show task info, list of assigned villages, reports per village.

---

## Todo List
- [ ] Create useTasks hook
- [ ] Create useTask hook
- [ ] Create useTaskReports hook
- [ ] Create TaskForm component
- [ ] Create VillageSelector component
- [ ] Create TaskCard component
- [ ] Create TaskFilters component
- [ ] Create AdminTasksPage
- [ ] Create CreateTaskPage
- [ ] Create TaskDetailPage
- [ ] Create ReportForm component
- [ ] Create ReportList component
- [ ] Create VillageTasksPage
- [ ] Test task creation flow
- [ ] Test report submission

---

## Success Criteria
- [ ] Admin can create tasks assigned to villages
- [ ] Village leader sees only assigned tasks
- [ ] Village leader can submit report
- [ ] Admin sees all reports per task
- [ ] Filtering works correctly
- [ ] Offline viewing of cached tasks

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing due date reminders | Medium | Add notifications in Phase 9+ |
| Report without evidence | Low | Add attachment support later |
| Task overload | Low | Show pending count on dashboard |

---

## Security Considerations
- Village leaders can only view/report their tasks
- Admin only can create/edit/delete tasks
- Validate village assignment exists

---

## Next Steps
After completion:
1. → Phase 08: Public Portal & Chatbot Integration
2. Add push notifications for new tasks
3. Add file attachments to reports
