# UI/UX Best Practices: Interactions & Loading States

**Focus:** Loading buttons, skeleton screens, hover effects, font loading
**Stack:** React 19 + Tailwind CSS 4 + TanStack Query
**Date:** 2026-01-16

---

## 1. Loading Button States

### React 19 Patterns
**useTransition for Non-Blocking Actions**
```tsx
const [isPending, startTransition] = useTransition();

<button
  onClick={() => startTransition(async () => await saveData())}
  disabled={isPending}
  className="relative disabled:opacity-50"
>
  {isPending && <Spinner className="absolute inset-0 m-auto" />}
  {isPending ? 'Saving...' : 'Save'}
</button>
```

**TanStack Query Mutation States**
```tsx
const mutation = useMutation({ mutationFn: saveData });

<button
  onClick={() => mutation.mutate()}
  disabled={mutation.isPending}
  className="min-w-[120px]" // Prevent width shift
>
  {mutation.isPending && <Loader2 className="animate-spin" />}
  {mutation.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

### Tailwind Patterns (No Layout Shift)
```tsx
// Fixed-width container prevents text change shift
<button className="relative min-w-[100px] disabled:cursor-not-allowed">
  <span className={isPending ? 'opacity-0' : ''}>Save</span>
  {isPending && (
    <span className="absolute inset-0 flex items-center justify-center">
      <Spinner />
    </span>
  )}
</button>

// Icon + Text with smooth transition
<button className="inline-flex items-center gap-2 disabled:opacity-60">
  <div className="w-4 h-4">
    {isPending ? <Spinner className="animate-spin" /> : <Check />}
  </div>
  <span>{isPending ? 'Processing...' : 'Submit'}</span>
</button>
```

---

## 2. Skeleton Screens (Dashboard)

### TanStack Query v5 Best Practices

**A. isPending Pattern (Simple)**
```tsx
const { data, isPending } = useQuery({
  queryKey: ['stats'],
  queryFn: fetchStats
});

if (isPending) return <StatsSkeleton />;
return <StatsGrid data={data} />;
```

**B. Suspense Pattern (Recommended)**
```tsx
// Parent: Declarative loading states
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>

// Child: No loading logic needed
const { data } = useSuspenseQuery({ queryKey: ['stats'], queryFn: fetchStats });
```

**C. Stale-While-Revalidate (Best UX)**
```tsx
// Show stale data during background refetch
const { data, isPending, isFetching } = useQuery({...});

if (isPending) return <Skeleton />; // Initial load only
return (
  <>
    {isFetching && <RefetchIndicator />} {/* Subtle spinner */}
    <StatsGrid data={data} />
  </>
);
```

### Tailwind Skeleton Components
```tsx
// High-fidelity skeleton matching real content
const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg border p-6 space-y-3">
    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
    <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
  </div>
);

// Dynamic list skeleton
const TableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border rounded">
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);
```

### Timing Rules (2025)
- **< 300ms:** Skip skeleton (flicker is jarring)
- **300ms – 3s:** Show skeleton
- **> 3s:** Add progress indicator or message

---

## 3. Hover States (No Layout Shift)

### Tailwind Anti-Shift Patterns

**Transform Instead of Layout Properties**
```tsx
// ❌ BAD: Causes layout shift
<button className="hover:border-2">Click me</button>

// ✅ GOOD: Transform-based scale
<button className="border-2 border-transparent hover:border-blue-500
  transition-colors duration-200">
  Click me
</button>

// ✅ GOOD: Scale with transform origin
<div className="hover:scale-105 transition-transform duration-200
  transform-gpu">
  Card content
</div>
```

**Shadow & Elevation (GPU-Accelerated)**
```tsx
// Smooth shadow transition
<div className="shadow-sm hover:shadow-lg transition-shadow duration-300">
  Card
</div>

// Combined effects (no layout shift)
<div className="border border-gray-200 rounded-lg
  hover:border-blue-400 hover:shadow-md
  transition-all duration-200">
  Interactive card
</div>
```

**Reserve Space for Interactive Elements**
```tsx
// Pre-allocate border space
<button className="border-2 border-gray-200 hover:border-blue-500">
  Button
</button>

// Use ring for outline effect (no layout change)
<button className="ring-2 ring-transparent hover:ring-blue-500
  transition-all">
  Button
</button>
```

---

## 4. Font Loading Strategy

### font-display Strategies (2025)

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `swap` | Immediate FOUT, swap when ready | Body text (readability priority) |
| `optional` | No swap if >100ms | Performance-critical, decorative fonts |
| `fallback` | ~100ms block, swap within 3s | Secondary text |
| `block` | 3s block | Icon fonts only (avoid for text) |

### Implementation

**Body Text (Recommended)**
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap; /* Immediate readability */
  font-weight: 100 900;
}
```

**Metric-Matching Fallback (Prevent FOUT Shift)**
```css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}

body {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
```

**Preload Critical Fonts**
```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font"
  type="font/woff2" crossorigin>
```

### Tailwind Config (v4)
```js
// tailwind.config.js
export default {
  theme: {
    fontFamily: {
      sans: ['Inter', 'Inter Fallback', 'system-ui', 'sans-serif'],
    }
  }
}
```

---

## Key Takeaways

1. **Loading Buttons:** Use `useTransition` (React 19) or TanStack Query mutations with fixed widths and absolute positioning for spinners
2. **Skeletons:** Prefer `useSuspenseQuery` + React Suspense; use `isPending` vs `isFetching` to avoid re-showing skeletons
3. **Hover Effects:** Use `transform`, `shadow`, `ring`, and pre-allocated borders to prevent layout shifts
4. **Fonts:** `font-display: swap` + preload + metric-matching fallbacks for body text; `optional` for decorative fonts

---

## Sources
- TanStack Query v5 Docs (Suspense guide)
- LogRocket: Skeleton Screen Best Practices
- web.dev: Font Loading Performance 2025
- Chrome DevTools: CLS Optimization Guide
