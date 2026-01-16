# Phase 4: Create Component Library

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Research:** [Target Styles](./research/researcher-01-website-styles.md) | [Current Styles](./research/researcher-02-current-styles.md)
- **Prerequisites:** Phase 2 (color tokens), Phase 3 (typography)

## Overview
- **Date:** 2026-01-16
- **Priority:** P1
- **Status:** pending
- **Effort:** 2h

Create reusable Button, Input, and Card base components using design tokens. Currently inline styles scattered across 24 components with inconsistent patterns.

## Key Insights

### Current Pattern (inconsistent)
```tsx
// Inline button in login-form.tsx
className="bg-primary-600 hover:bg-primary-700 px-6 py-4 rounded-lg font-semibold min-h-[56px]"
style={{ minHeight: 'var(--spacing-touch-lg)' }}
```

### Target Pattern (component-based)
```tsx
<Button variant="primary" size="lg">Đăng nhập</Button>
```

### Components Needed
1. **Button** - Primary, secondary, outline, ghost variants
2. **Input** - Text, password, search with error states
3. **Card** - Base, stats, action variants

## Requirements

### Functional
- Button: 4 variants (primary, secondary, outline, ghost), 3 sizes (sm, md, lg)
- Input: error state, disabled state, icon slots
- Card: padding variants, border accent option

### Non-Functional
- 48px minimum touch targets (elderly users)
- WCAG AAA focus indicators
- Semantic color token usage
- TypeScript interfaces

## Architecture

### Component Structure
```
web/src/components/ui/
├── button.tsx      # NEW
├── input.tsx       # NEW
├── card.tsx        # NEW
├── spinner.tsx     # EXISTS
└── national-emblem.tsx  # EXISTS
```

### Button Variants
```
Variants:
├── primary: bg-primary-600, text-white, hover:bg-primary-700
├── secondary: bg-secondary, text-foreground
├── outline: border-primary-600, text-primary-600
└── ghost: transparent, hover:bg-muted

Sizes:
├── sm: min-h-10, px-4, text-sm
├── md: min-h-12, px-6, text-base (touch target)
└── lg: min-h-14, px-8, text-lg (elderly optimal)
```

### Input Structure
```
States:
├── default: border-border
├── focus: border-primary-500, ring-4 ring-gov-gold/20
├── error: border-error, ring-error/20
└── disabled: opacity-50, cursor-not-allowed
```

### Card Structure
```
Variants:
├── default: bg-card, rounded-xl, shadow-sm
├── bordered: + border border-border
└── accent: + border-l-4 border-l-primary-600
```

## Related Code Files

### To Create
- `web/src/components/ui/button.tsx`
- `web/src/components/ui/input.tsx`
- `web/src/components/ui/card.tsx`

### To Reference
- `web/src/lib/utils.ts` - cn() helper

### To Update Later (Phase 5)
- Components using inline button/input/card styles

## Implementation Steps

### 1. Create Button Component

```tsx
// web/src/components/ui/button.tsx
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gov-gold/30 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'hover:bg-muted text-foreground',
  },
  sizes: {
    sm: 'min-h-10 px-4 text-sm',
    md: 'min-h-12 px-6 text-base',
    lg: 'min-h-14 px-8 text-lg',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants.base,
        buttonVariants.variants[variant],
        buttonVariants.sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
```

### 2. Create Input Component

```tsx
// web/src/components/ui/input.tsx
import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'min-h-12 w-full px-4 py-3 rounded-lg border bg-background',
        'text-foreground placeholder:text-muted-foreground',
        'transition-colors',
        'focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-gov-gold/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-error focus:ring-error/20',
        !error && 'border-border',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'
```

### 3. Create Card Component

```tsx
// web/src/components/ui/card.tsx
import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'accent'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card rounded-xl p-6',
        variant === 'default' && 'shadow-sm',
        variant === 'bordered' && 'border border-border',
        variant === 'accent' && 'border-l-4 border-l-primary-600 shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

// Sub-components
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'
```

### 4. Create Index Export

```tsx
// web/src/components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Card, CardHeader, CardTitle, CardContent } from './card'
export { Spinner } from './spinner'
```

### 5. Add Tailwind Utilities (globals.css)

```css
/* Touch target utilities */
.min-h-touch { min-height: var(--spacing-touch); }
.min-h-touch-lg { min-height: var(--spacing-touch-lg); }
```

### 6. Build and Test

```bash
cd web && npm run build
```

### 7. Create Storybook/Test Page (optional)

Quick visual test of components in isolation.

## Todo List
- [ ] Create button.tsx with variants
- [ ] Create input.tsx with error state
- [ ] Create card.tsx with sub-components
- [ ] Create ui/index.ts barrel export
- [ ] Add touch utility classes
- [ ] TypeScript types verified
- [ ] Build passes
- [ ] Visual test components

## Success Criteria
- 3 new components created with TypeScript
- All variants render correctly
- 48px+ touch targets enforced
- Focus states use gov-gold ring
- Components use semantic tokens

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type errors | Low | Low | Use standard HTML props |
| Style conflicts | Medium | Low | cn() merges properly |
| Import path issues | Low | Low | Use @/ alias |

## Security Considerations
None - UI components only.

## Next Steps
Proceed to [Phase 5: Update Layout Components](./phase-05-update-layout-components.md)
