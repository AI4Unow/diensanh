# Phase 03: Portal-Wide Component Updates

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01: Color Tokens](./phase-01-update-color-tokens.md)
- [Phase 02: Hero Section](./phase-02-update-hero-section.md)

## Overview
- **Priority**: P1
- **Status**: pending
- **Effort**: 30 minutes
- **Description**: Apply light theme consistency to all portal pages (validated: full site consistency)

## Key Insights
- User requested full site consistency (not just hero section)
- All portal components should use light gray body background
- White cards maintain current styling (already good)
- Portal layout wrapper needs background update

## Requirements

### Functional
- Update portal-layout.tsx body background to light gray
- Ensure all card components have proper contrast on light background
- Update any remaining dark-themed sections

### Non-functional
- WCAG AAA contrast for all text (4.5:1+)
- Maintain 48px+ touch targets
- Consistent visual experience across all portal pages

## Related Code Files

### Modify
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/portal-layout.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/portal/quick-access-card.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/portal/contact-info-card.tsx`

## Implementation Steps

### Step 1: Update Portal Layout Background
In `portal-layout.tsx`, line 30:

FROM:
```tsx
<div className="min-h-screen flex flex-col bg-background">
```

TO:
```tsx
<div className="min-h-screen flex flex-col bg-[#F5F5F5]">
```

### Step 2: Update Quick Access Section Background
In `pages/portal/index.tsx`, line 15:

FROM:
```tsx
<section className="px-4 -mt-8 relative z-10">
```

TO:
```tsx
<section className="px-4 -mt-8 relative z-10 pb-8">
```

### Step 3: Verify Card Styling
- `quick-access-card.tsx`: Already uses `bg-white` - no change needed
- `contact-info-card.tsx`: Already uses `bg-white` - no change needed
- Verify border colors work on light gray background

### Step 4: Update Contact Section Background
In `pages/portal/index.tsx`, line 49:

FROM:
```tsx
<section className="px-4 py-12">
```

TO:
```tsx
<section className="px-4 py-12 bg-[#F5F5F5]">
```

Note: May not be needed if portal-layout already applies bg-[#F5F5F5]

## Todo List
- [ ] Update portal-layout.tsx background to #F5F5F5
- [ ] Verify quick-access-card renders well on light gray
- [ ] Verify contact-info-card renders well on light gray
- [ ] Check announcement page styling
- [ ] Check request-form page styling
- [ ] Check chatbot page styling
- [ ] Visual testing on all portal pages

## Success Criteria
- All portal pages use light gray body background
- White cards contrast properly against #F5F5F5
- Consistent visual experience matching diensanh.quangtri.gov.vn
- No dark navy gradients in any portal section

## Risk Assessment
- **Low**: Card components already use white backgrounds
- Mitigation: Verify each page visually after changes

## Security Considerations
- N/A (CSS changes only)

## Next Steps
- Run `npm run build` to verify no errors
- Visual testing in browser on all portal pages
- Compare side-by-side with diensanh.quangtri.gov.vn
