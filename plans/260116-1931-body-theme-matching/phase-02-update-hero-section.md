# Phase 02: Update Hero Section

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01: Color Tokens](./phase-01-update-color-tokens.md)
- [Banner Color Analysis](./research/researcher-02-banner-color-analysis.md)

## Overview
- **Priority**: P1
- **Status**: pending
- **Effort**: 45 minutes
- **Description**: Transform hero section from dark navy to light theme matching gov standards

## Key Insights
- Current: dark navy gradient with white text
- Target: light gray/white background with dark text and navy "Xin chào!" accent (validated)
- Search bar stays white with shadow
- Suggestion links need dark text color

## Requirements

### Functional
- Change background to light gray (`bg-body-bg` or similar)
- "Xin chào!" heading in navy (`text-[#1A237E]`) - validated choice
- Subtitle in dark gray (`text-foreground`)
- Search suggestions in dark gray with hover state

### Non-functional
- WCAG AAA contrast for all text (4.5:1+)
- Maintain 48px+ touch targets
- Smooth visual transition from header banner

## Architecture

### Before
```
HeroSection
├── bg: gradient navy (primary-600 → primary-800)
├── h1: white
├── p: primary-100 (light blue)
└── suggestions: white text
```

### After
```
HeroSection
├── bg: light gray (body-bg) or gradient-hero-light
├── h1: navy (#1A237E) - validated
├── p: dark gray (foreground)
└── suggestions: muted-foreground with navy hover
```

## Related Code Files

### Modify
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/portal/hero-section.tsx`

## Implementation Steps

### Step 1: Update Section Background
Change line 10-13:

FROM:
```tsx
<section className={cn(
  "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 px-4",
  className
)}>
```

TO:
```tsx
<section className={cn(
  "bg-[oklch(97%_0_0)] py-16 px-4 border-b border-[oklch(90%_0_0)]",
  className
)}>
```

### Step 2: Update Heading "Xin chào!"
Change line 16-18:

FROM:
```tsx
<h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
  Xin chào!
</h1>
```

TO:
```tsx
<h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-[#1A237E]">
  Xin chào!
</h1>
```

### Step 3: Update Subtitle Text
Change line 19-21:

FROM:
```tsx
<p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
```

TO:
```tsx
<p className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed">
```

### Step 4: Update Search Suggestions
Change lines 42-55. Update suggestion styling:

FROM:
```tsx
<span className="text-sm text-primary-200">Tìm kiếm phổ biến:</span>
<button className="text-sm text-white hover:text-gov-gold underline cursor-pointer">
  Giấy khai sinh
</button>
<span className="text-primary-300">•</span>
```

TO:
```tsx
<span className="text-sm text-muted-foreground">Tìm kiếm phổ biến:</span>
<button className="text-sm text-foreground hover:text-[#1A237E] underline cursor-pointer">
  Giấy khai sinh
</button>
<span className="text-muted-foreground">•</span>
```

Apply same pattern to all three suggestion buttons and separators.

### Step 5: Update Search Button Icon Color
Line 33:

FROM:
```tsx
className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 text-muted-foreground hover:text-primary-600 transition-colors cursor-pointer"
```

TO:
```tsx
className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 text-muted-foreground hover:text-[#1A237E] transition-colors cursor-pointer"
```

## Todo List
- [ ] Update section background to light gray
- [ ] Add border-b for subtle header separation
- [ ] Update h1 to navy accent color (#1A237E)
- [ ] Update subtitle to foreground color
- [ ] Update all suggestion text colors
- [ ] Update search icon hover color
- [ ] Verify contrast ratios meet WCAG AAA
- [ ] Test on mobile viewport
- [ ] Visual comparison with header banner

## Success Criteria
- Hero section uses light gray background (#F5F5F5)
- "Xin chào!" displays in navy (#1A237E)
- All text meets WCAG AAA contrast (4.5:1+)
- Visual cohesion with header banner
- Smooth transition via subtle border
- All interactive elements maintain 48px touch targets

## Risk Assessment
- **Medium**: Color changes affect UX perception
- Mitigation: Use exact colors from banner analysis
- Mitigation: Test with users if possible

## Security Considerations
- N/A (CSS changes only)

## Next Steps
- Run `npm run build` to verify no TypeScript errors
- Visual testing in browser
- Compare side-by-side with reference gov sites
