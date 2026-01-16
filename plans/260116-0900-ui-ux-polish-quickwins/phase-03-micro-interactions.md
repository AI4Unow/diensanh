# Phase 3: Micro-interactions

## Context Links

- [Interactions & Loading Research](research/researcher-02-interactions-loading.md)

## Overview

| Priority | Status | Effort |
|----------|--------|--------|
| P1 (High) | pending | 90min |

Add loading button patterns, card hover states, and improve skeleton consistency.

## Key Insights from Research

- Use **TanStack Query mutations** (`isPending`) for loading states
- Fixed width + absolute positioning prevents button shift
- Hover: use `ring`, `shadow`, `border` (not layout-changing properties)
- `transform-gpu` for smooth animations
- Skip skeleton if load <300ms (flicker is jarring)

## Requirements

### Functional

- Loading buttons show spinner + disabled state via TanStack Query `isPending`
- StatsCard has smooth hover effect
- QuickActions cards have hover state
- Skeletons match actual content dimensions

### Non-functional

- No layout shift on hover or loading state change
- GPU-accelerated animations
- Consistent animation timing (200ms)

## Related Code Files

| Action | File Path |
|--------|-----------|
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/auth/login-form.tsx` |
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/dashboard/stats-card.tsx` |
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/dashboard/quick-actions.tsx` |
| Create | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/ui/spinner.tsx` |

## Implementation Steps

### 1. Create Spinner component

Create `web/src/components/ui/spinner.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
```

### 2. Update login-form.tsx buttons

Replace button content with loading pattern (no layout shift) using TanStack Query `isPending`:

```tsx
// Assume mutation hook usage:
// const { mutate, isPending } = useMutation({ ... })

<button
  type="submit"
  disabled={isPending || !phone}
  className={cn(
    "w-full py-3 px-4 rounded-lg font-medium relative",
    "bg-primary-600 text-white",
    "hover:bg-primary-700 transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "min-h-[48px]" // Fixed height prevents shift
  )}
>
  <span className={isPending ? 'opacity-0' : ''}>Nhan ma OTP</span>
  {isPending && (
    <span className="absolute inset-0 flex items-center justify-center">
      <Spinner size="sm" />
    </span>
  )}
</button>
```

### 3. Add hover state to StatsCard

Update StatsCard component:

```tsx
<div className={cn(
  'bg-card rounded-xl border p-5 shadow-sm',
  'transition-all duration-200',
  'hover:shadow-md hover:border-primary-200',
  className
)}>
```

### 4. Improve StatsCardSkeleton

Make skeleton match actual content more closely:

```tsx
function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="w-10 h-10 bg-primary-50 rounded-lg animate-pulse" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
```

### 5. Add ring hover to QuickActions cards

Update Link className in quick-actions.tsx:

```tsx
className="group flex flex-col items-center p-4 rounded-lg border border-transparent
  ring-2 ring-transparent
  hover:ring-primary-200 hover:border-primary-300 hover:bg-primary-50/50
  transition-all duration-200 cursor-pointer"
```

## Todo List

- [ ] Create Spinner component at ui/spinner.tsx
- [ ] Update login-form.tsx with loading button pattern
- [ ] Add hover states to StatsCard (shadow-md, border-primary-200)
- [ ] Improve StatsCardSkeleton to match content layout
- [ ] Add ring hover effect to QuickActions cards
- [ ] Test hover effects for layout shift (use DevTools)
- [ ] Verify animations are smooth (60fps)

## Success Criteria

- Buttons show spinner centered during loading
- Button width stays constant during loading
- StatsCard lifts subtly on hover
- QuickActions cards highlight with ring on hover
- No layout shift detected in DevTools

## Security Considerations

- No security implications for UI interactions
