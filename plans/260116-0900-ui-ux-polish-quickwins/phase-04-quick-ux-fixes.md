# Phase 4: Quick UX Fixes

## Context Links

- [Interactions & Loading Research](research/researcher-02-interactions-loading.md)

## Overview

| Priority | Status | Effort |
|----------|--------|--------|
| P2 (Medium) | pending | 30min |

Apply quick UX improvements: cursor-pointer on interactive elements, focus states, and image lazy loading.

## Key Insights from Research

- `cursor-pointer` expected on all clickable elements
- Focus states critical for keyboard navigation (WCAG)
- `ring-2 ring-offset-2` pattern for visible focus
- Native `loading="lazy"` for images below fold
- **Minimum 48px touch targets** for elderly users

## Requirements

### Functional

- All buttons/links show pointer cursor
- Focus states visible on keyboard navigation
- Images lazy load to improve LCP
- **Interactive elements have min-height/width of 48px**

### Non-functional

- No additional JS for lazy loading
- Focus styles match brand colors
- Keyboard navigable (Tab key)

## Related Code Files

| Action | File Path |
|--------|-----------|
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/styles/globals.css` |
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/sidebar.tsx` |
| Modify | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/dashboard/quick-actions.tsx` |

## Implementation Steps

### 1. Add global cursor and focus styles

Add to globals.css after body styles:

```css
/* Interactive elements */
button,
[role="button"],
a,
input[type="submit"],
input[type="button"],
input[type="checkbox"],
input[type="radio"],
select {
  cursor: pointer;
  min-height: 48px; /* Touch target size for elderly users */
  min-width: 48px;
}

button:disabled,
[disabled] {
  cursor: not-allowed;
}

/* Focus styles */
:focus-visible {
  outline: none;
  ring: 2px solid var(--color-ring);
  ring-offset: 2px;
  ring-offset-color: var(--color-background);
}

/* Tailwind focus-visible utility override */
.focus-visible\:ring-2:focus-visible {
  --tw-ring-offset-width: 2px;
  --tw-ring-color: var(--color-primary-500);
}
```

### 2. Update sidebar nav links with focus-visible

Add focus-visible classes to NavLink in sidebar.tsx:

```tsx
className={cn(
  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
  'hover:bg-muted',
  'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  isActive && 'bg-primary-50 text-primary-700 font-medium',
  !open && !mobileOpen && 'justify-center'
)}
```

### 3. Update QuickActions with focus-visible

Add to Link className in quick-actions.tsx:

```tsx
className="group flex flex-col items-center p-4 rounded-lg border border-transparent
  ring-2 ring-transparent
  hover:ring-primary-200 hover:border-primary-300 hover:bg-primary-50/50
  focus-visible:ring-primary-500 focus-visible:ring-offset-2
  transition-all duration-200"
```

### 4. Add lazy loading utility class

Add to globals.css:

```css
/* Lazy loading for images */
img[loading="lazy"] {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

img[loading="lazy"].loaded,
img[loading="lazy"]:not([src=""]) {
  opacity: 1;
}
```

Note: Add `loading="lazy"` attribute to any `<img>` tags in the codebase as encountered.

## Todo List

- [ ] Add cursor-pointer to interactive elements in globals.css
- [ ] Add :focus-visible ring styles globally
- [ ] Update sidebar NavLink with focus-visible classes
- [ ] Update QuickActions Link with focus-visible classes
- [ ] Add lazy loading CSS transition for images
- [ ] Test keyboard navigation (Tab through sidebar, actions)
- [ ] Verify focus ring is visible on all themes

## Success Criteria

- All buttons show pointer cursor on hover
- Tab navigation shows clear focus ring
- Focus ring uses primary brand color
- Disabled elements show not-allowed cursor

## Security Considerations

- No security implications for UX fixes
