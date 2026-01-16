# Phase 3: Portal Homepage Redesign

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2: Core Layout](./phase-02-core-layout-components.md)
- [Current Portal Page](../../web/src/pages/portal/index.tsx)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** 3h
- **Description:** Redesign public portal homepage with government branding, elderly-friendly cards, and simplified navigation

## Key Insights
- Current homepage has small text, insufficient contrast
- Quick action cards lack visual hierarchy
- Hero section generic, needs official branding
- Popular services should be most prominent (3-click rule)
- Search should be prominent (many skip navigation)

## Requirements

### Functional
- Integrate PortalLayout (from Phase 2)
- Create hero section with government branding
- Redesign quick action cards with larger icons, clearer text
- Add search bar prominently
- Show popular services first
- Add "Hotline" quick-access button for elderly

### Non-Functional
- Touch targets: 56px for primary actions
- Text: 18px minimum for all content
- Cards: Clear boundaries, generous padding
- Load time: <3s on 3G (optimize images)

## Architecture

### Page Structure
```
PortalHomePage
├── PortalLayout (from Phase 2)
│   ├── GovernmentHeader
│   ├── main
│   │   ├── HeroSection (emblem, welcome, search)
│   │   ├── QuickAccessGrid (4 primary services)
│   │   ├── HotlineButton (sticky on mobile)
│   │   ├── ContactInfoCard
│   │   └── AnnouncementsBanner (optional)
│   └── GovernmentFooter
```

## Related Code Files

### Files to Modify
| File | Changes |
|------|---------|
| `web/src/pages/portal/index.tsx` | Complete redesign with new layout and components |

### Files to Create
| File | Purpose |
|------|---------|
| `web/src/components/portal/hero-section.tsx` | Hero with emblem, search |
| `web/src/components/portal/quick-access-card.tsx` | Large, accessible action cards |
| `web/src/components/portal/hotline-button.tsx` | Sticky call button for mobile |

## Implementation Steps

### 1. Create Hero Section Component
```tsx
// web/src/components/portal/hero-section.tsx
// Features:
// - National emblem (centered on mobile)
// - Welcome text: "Xin chào! Chúng tôi có thể giúp gì cho bạn?"
// - Prominent search bar (min 56px height)
// - Government blue background gradient
// - Large, readable Vietnamese text (24px heading, 18px body)
```

### 2. Create Quick Access Card Component
```tsx
// web/src/components/portal/quick-access-card.tsx
// Features:
// - Min height: 120px
// - Large icon (48px) with color background
// - Bold title (20px)
// - Short description (16px, muted)
// - Full card is clickable (link wrapper)
// - Hover/focus state with gov-blue border
// - Touch target: entire card (well above 48px)
```

### 3. Create Hotline Button
```tsx
// web/src/components/portal/hotline-button.tsx
// Features:
// - Sticky bottom-right on mobile
// - Phone icon + "Gọi: 0233.xxx.xxx"
// - Gov-red background (attention-grabbing)
// - Min 56px touch target
// - Triggers tel: link
```

### 4. Redesign Portal Homepage
```tsx
// web/src/pages/portal/index.tsx

export function PortalHomePage() {
  return (
    <PortalLayout>
      {/* Hero with search */}
      <HeroSection />

      {/* Primary actions - 2x2 grid */}
      <section className="px-4 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
          <QuickAccessCard
            icon={<Bell />}
            title="Thông báo"
            description="Xem các thông báo mới nhất"
            href="/portal/announcements"
            color="blue"
          />
          <QuickAccessCard
            icon={<FileText />}
            title="Gửi yêu cầu"
            description="Gửi đơn, kiến nghị, phản ánh"
            href="/portal/requests/new"
            color="green"
          />
          <QuickAccessCard
            icon={<Search />}
            title="Tra cứu"
            description="Tra cứu tình trạng yêu cầu"
            href="/portal/requests"
            color="purple"
          />
          <QuickAccessCard
            icon={<MessageSquare />}
            title="Hỏi đáp"
            description="Chatbot hỗ trợ 24/7"
            href="/portal/chatbot"
            color="orange"
          />
        </div>
      </section>

      {/* Contact Info */}
      <section className="px-4 py-8">
        <ContactInfoCard />
      </section>

      {/* Mobile hotline button */}
      <HotlineButton className="lg:hidden" />
    </PortalLayout>
  )
}
```

### 5. Update Styling
- Ensure all card text is 18px minimum
- Add generous padding (p-6 minimum)
- Use gov-blue for primary actions
- Add subtle shadows for depth
- High contrast text (#0f172a on white)

### 6. Optimize for Performance
- Lazy load non-critical sections
- Use CSS containment on cards
- Preconnect to any external resources

## Todo List

- [ ] Create hero-section.tsx with emblem and search
- [ ] Create quick-access-card.tsx with large touch targets
- [ ] Create hotline-button.tsx with tel: link
- [ ] Rewrite portal/index.tsx with new components
- [ ] Integrate PortalLayout wrapper
- [ ] Ensure 2x2 grid on mobile, 4-column on desktop
- [ ] Add focus states with 4px gov-blue outline
- [ ] Test search bar on mobile keyboard
- [ ] Verify all text >= 18px
- [ ] Test on slow network (Chrome DevTools throttle)
- [ ] Run build and verify no errors

## Success Criteria
- [ ] Hero prominently shows emblem and search
- [ ] All quick access cards have 56px+ touch area
- [ ] Text meets 18px minimum
- [ ] Hotline button visible on mobile
- [ ] Page loads in <3s on simulated 3G
- [ ] Keyboard navigation works logically

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Search bar hard to use on mobile | High | Large input, clear placeholder |
| Too many options overwhelm users | Medium | Limit to 4 primary actions |
| Cards don't fit on small screens | Medium | 2-column grid with scroll |

## Security Considerations
- Search input must sanitize queries
- Tel: links should not expose internal numbers

## Next Steps
- After completion, proceed to [Phase 4: Login Auth Flow](./phase-04-login-auth-flow.md)
