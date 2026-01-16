# Phase 08: Public Portal & Chatbot Integration

## Context Links
- [Plan Overview](./plan.md)
- Existing Chatbot: `src/api/api-server.py`
- Existing Widget: `src/widget/`

## Overview
| Field | Value |
|-------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 12h |
| Dependencies | Phase 01-03 complete |

Public-facing portal with announcements, policy lookup, request submission, and RAG chatbot integration.

---

## Key Insights
- Existing FastAPI chatbot uses ai4u.now API with TF-IDF search
- Widget embed already exists but needs refresh
- No auth required for public portal
- Announcements filter by isPublished + not expired

---

## Requirements

### Functional
- FR1: View published announcements (news, policies, events)
- FR2: Search announcements
- FR3: Submit service request (no auth)
- FR4: Track request by phone number
- FR5: Embedded chatbot for Q&A
- FR6: Contact information display

### Non-Functional
- NFR1: Public pages SEO-friendly
- NFR2: Fast initial load (<2s)
- NFR3: Mobile-optimized
- NFR4: Works offline (cached content)

---

## Architecture

### Routes
```
/                    → Landing page
/thong-bao           → Announcements list
/thong-bao/:id       → Announcement detail
/chinh-sach          → Policy lookup
/gui-yeu-cau         → Submit request
/tra-cuu-yeu-cau     → Track request
/lien-he             → Contact info
```

### Components
```
src/components/portal/
├── portal-header.tsx          # Public header/nav
├── portal-footer.tsx          # Footer with contact
├── announcement-list.tsx      # Announcements grid
├── announcement-card.tsx      # Announcement card
├── announcement-detail.tsx    # Full announcement
├── request-form.tsx           # Submit request
├── request-tracker.tsx        # Track by phone
├── chatbot-widget.tsx         # Embedded chatbot
└── contact-info.tsx           # Contact display

src/pages/portal/
├── index.tsx                  # Landing page
├── announcements/
│   ├── index.tsx
│   └── [id].tsx
├── submit-request.tsx
├── track-request.tsx
└── contact.tsx

src/layouts/
└── portal-layout.tsx          # Public layout
```

---

## Related Code Files

### Create
- `src/components/portal/portal-header.tsx`
- `src/components/portal/portal-footer.tsx`
- `src/components/portal/announcement-list.tsx`
- `src/components/portal/announcement-card.tsx`
- `src/components/portal/request-form.tsx`
- `src/components/portal/request-tracker.tsx`
- `src/components/portal/chatbot-widget.tsx`
- `src/pages/portal/index.tsx`
- `src/pages/portal/announcements/index.tsx`
- `src/pages/portal/announcements/[id].tsx`
- `src/pages/portal/submit-request.tsx`
- `src/pages/portal/track-request.tsx`
- `src/pages/portal/contact.tsx`
- `src/layouts/portal-layout.tsx`
- `src/hooks/use-announcements.ts`
- `src/hooks/use-request.ts`

### Modify
- `src/routes/index.tsx` - Add public routes
- `src/widget/` - Update chatbot widget

---

## Implementation Steps

### 1. Create PortalLayout (1h)
```typescript
// src/layouts/portal-layout.tsx
export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PortalHeader />
      <main className="flex-1">{children}</main>
      <PortalFooter />
      <ChatbotWidget />
    </div>
  )
}
```

### 2. Create PortalHeader (1h)
```typescript
// src/components/portal/portal-header.tsx
const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Thông báo', href: '/thong-bao' },
  { label: 'Chính sách', href: '/chinh-sach' },
  { label: 'Gửi yêu cầu', href: '/gui-yeu-cau' },
  { label: 'Liên hệ', href: '/lien-he' },
]

export function PortalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-10" />
            <div>
              <div className="font-bold">UBND Xã Diên Sanh</div>
              <div className="text-xs text-primary-foreground/70">
                Tỉnh Quảng Trị
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <NavLink key={item.href} to={item.href} className="hover:underline">
                {item.label}
              </NavLink>
            ))}
            <Button asChild variant="secondary" size="sm">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
```

### 3. Create Landing Page (1.5h)
```typescript
// src/pages/portal/index.tsx
export function PortalHomePage() {
  const { data: announcements } = useAnnouncements({ limit: 6 })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Chào mừng đến với Cổng thông tin Xã Diên Sanh
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Tỉnh Quảng Trị
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/gui-yeu-cau">Gửi yêu cầu</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/tra-cuu-yeu-cau">Tra cứu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Thông báo mới</h2>
            <Link to="/thong-bao" className="text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements?.map(a => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Dịch vụ công</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLinkCard icon={<FileText />} label="Thủ tục hành chính" />
            <QuickLinkCard icon={<Building />} label="Thông tin xã" />
            <QuickLinkCard icon={<Phone />} label="Liên hệ" />
            <QuickLinkCard icon={<MessageCircle />} label="Hỏi đáp" />
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 4. Create useAnnouncements Hook (1h)
```typescript
// src/hooks/use-announcements.ts
export function useAnnouncements(options?: { type?: string; limit?: number }) {
  const { db } = useFirestore()

  return useQuery({
    queryKey: ['announcements', options],
    queryFn: async () => {
      const now = new Date()
      let q = query(
        collection(db, 'announcements'),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(options?.limit ?? 20)
      )

      if (options?.type) {
        q = query(q, where('type', '==', options.type))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Announcement)
        .filter(a => !a.expiresAt || a.expiresAt.toDate() > now)
    },
    staleTime: 5 * 60 * 1000,
  })
}
```

### 5. Create AnnouncementCard (0.5h)
```typescript
// src/components/portal/announcement-card.tsx
export function AnnouncementCard({ announcement }: Props) {
  const typeColors = {
    news: 'bg-blue-100 text-blue-700',
    policy: 'bg-green-100 text-green-700',
    event: 'bg-purple-100 text-purple-700',
    urgent: 'bg-red-100 text-red-700'
  }

  return (
    <Link
      to={`/thong-bao/${announcement.id}`}
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition"
    >
      <span className={cn('px-2 py-0.5 rounded text-xs', typeColors[announcement.type])}>
        {typeLabels[announcement.type]}
      </span>
      <h3 className="font-semibold mt-2 line-clamp-2">{announcement.title}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{announcement.content}</p>
      <div className="text-xs text-gray-400 mt-2">
        {format(announcement.publishedAt.toDate(), 'dd/MM/yyyy')}
      </div>
    </Link>
  )
}
```

### 6. Create RequestForm (2h)
```typescript
// src/components/portal/request-form.tsx
const requestTypes = [
  'Xác nhận cư trú',
  'Xác nhận hộ nghèo',
  'Hỗ trợ thiên tai',
  'Khiếu nại, tố cáo',
  'Góp ý, kiến nghị',
  'Khác'
]

export function RequestForm() {
  const createMutation = useCreateRequest()
  const [submitted, setSubmitted] = useState(false)
  const [trackingPhone, setTrackingPhone] = useState('')

  const form = useForm<RequestFormData>({
    defaultValues: {
      type: '',
      title: '',
      description: '',
      submitterName: '',
      submitterPhone: '',
    }
  })

  const onSubmit = (data: RequestFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setTrackingPhone(data.submitterPhone)
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Gửi yêu cầu thành công!</h2>
        <p className="text-gray-600 mb-4">
          Yêu cầu của bạn đã được tiếp nhận. Bạn có thể tra cứu kết quả bằng số điện thoại.
        </p>
        <Button asChild>
          <Link to={`/tra-cuu-yeu-cau?phone=${trackingPhone}`}>
            Tra cứu yêu cầu
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Loại yêu cầu *</Label>
        <Select {...form.register('type', { required: true })}>
          <SelectItem value="">Chọn loại yêu cầu</SelectItem>
          {requestTypes.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </Select>
      </div>

      <div>
        <Label>Tiêu đề *</Label>
        <Input {...form.register('title', { required: true })} />
      </div>

      <div>
        <Label>Nội dung chi tiết *</Label>
        <Textarea {...form.register('description', { required: true })} rows={5} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Họ tên *</Label>
          <Input {...form.register('submitterName', { required: true })} />
        </div>
        <div>
          <Label>Số điện thoại *</Label>
          <Input {...form.register('submitterPhone', { required: true })} />
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </Button>
    </form>
  )
}
```

### 7. Create RequestTracker (1.5h)
```typescript
// src/components/portal/request-tracker.tsx
export function RequestTracker() {
  const [phone, setPhone] = useState('')
  const { data: requests, isLoading, refetch } = useRequestsByPhone(phone, {
    enabled: false
  })

  const handleSearch = () => {
    if (phone.length >= 10) refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại..."
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Đang tìm...' : 'Tra cứu'}
        </Button>
      </div>

      {requests && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Không tìm thấy yêu cầu nào
            </p>
          ) : (
            requests.map(req => (
              <RequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

### 8. Create ChatbotWidget (2h)
```typescript
// src/components/portal/chatbot-widget.tsx
export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const chatMutation = useChatbot()

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    chatMutation.mutate({ message: input }, {
      onSuccess: (response) => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.response,
          sources: response.sources
        }])
      }
    })
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Trợ lý ảo UBND xã</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-3 p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[80%] p-3 rounded-lg',
                  msg.role === 'user'
                    ? 'ml-auto bg-primary text-white'
                    : 'bg-gray-100'
                )}
              >
                {msg.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
                Đang trả lời...
              </div>
            )}
          </div>

          <div className="flex gap-2 p-4 border-t">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>Gửi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### 9. Create useChatbot Hook (0.5h)
```typescript
// src/hooks/use-chatbot.ts
export function useChatbot() {
  return useMutation({
    mutationFn: async (data: { message: string }) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: data.message })
      })
      return response.json()
    }
  })
}
```

### 10. Setup Public Routes (1h)
Add routes with PortalLayout wrapper.

---

## Todo List
- [ ] Create PortalLayout
- [ ] Create PortalHeader with nav
- [ ] Create PortalFooter
- [ ] Create Landing page
- [ ] Create useAnnouncements hook
- [ ] Create AnnouncementCard
- [ ] Create AnnouncementsPage
- [ ] Create AnnouncementDetail page
- [ ] Create RequestForm
- [ ] Create RequestTracker
- [ ] Create ChatbotWidget
- [ ] Create useChatbot hook
- [ ] Setup public routes
- [ ] Test request submission
- [ ] Test chatbot integration

---

## Success Criteria
- [ ] Public pages accessible without auth
- [ ] Announcements display correctly
- [ ] Request submission works
- [ ] Request tracking by phone works
- [ ] Chatbot responds with relevant answers
- [ ] Mobile-responsive design
- [ ] SEO meta tags present

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Chatbot API down | Medium | Show friendly error, offer contact info |
| Spam requests | Medium | Rate limit, CAPTCHA |
| SEO not indexed | Low | Add sitemap, robots.txt |

---

## Security Considerations
- Validate phone format before query
- Rate limit request submissions (10/hour/IP)
- Sanitize HTML in announcements
- No PII exposed in public queries

---

## Next Steps
After completion:
1. → Phase 09: PWA & Offline Support
2. Add CAPTCHA to request form
3. SEO optimization
