# Layout Components Analysis Report

**Date:** 2026-01-16 14:48  
**Status:** Complete  
**Scope:** 6 layout components from Phase 5

---

## Executive Summary

All 6 layout components have been located and analyzed. Components use a mix of semantic design tokens (primary-600, muted-foreground, etc.) and hardcoded color values (bg-white, border-gov-red, bg-slate-50). Key findings:

- **Hardcoded colors found:** bg-white, bg-slate-50, border-gov-red, gov-gold
- **Semantic tokens used:** primary-600, primary-700, primary-50, primary-100, muted-foreground, destructive, bg-card, border
- **Update priority:** HIGH - Multiple components need token migration

---

## Component Analysis

### 1. government-header.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/government-header.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Header background | `bg-white` | Hardcoded color - should use semantic token |
| Header border | `border-b-4 border-gov-red` | Uses custom gov-red token (acceptable) |
| Title text | `text-primary-600` | Semantic token ✓ |
| Subtitle text | `text-muted-foreground` | Semantic token ✓ |
| Search input border | `border-border` | Semantic token ✓ |
| Search focus ring | `focus:ring-primary-500` | Semantic token ✓ |
| Login button | `bg-primary-600 hover:bg-primary-700` | Semantic tokens ✓ |
| Login button text | `text-white` | Hardcoded - should use semantic token |

**Key Areas Needing Updates:**

1. **Line 17:** `bg-white` → should use `bg-surface` or `bg-card` semantic token
2. **Line 60:** `text-white` → should use `text-surface-foreground` or similar semantic token
3. **Line 17:** `border-gov-red` → verify if gov-red is defined in design tokens

**Dependencies:**
- NationalEmblem component
- Uses cn() utility for class merging

---

### 2. government-footer.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/government-footer.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Footer background | `bg-slate-50` | Hardcoded color - should use semantic token |
| Footer top border | `border-t-4 border-gov-red` | Uses custom gov-red token |
| Section headings | `text-primary-600` | Semantic token ✓ |
| Body text | `text-muted-foreground` | Semantic token ✓ |
| Links hover | `hover:text-primary-600` | Semantic token ✓ |
| Bottom bar background | `bg-primary-600` | Semantic token ✓ |
| Bottom bar text | `text-white` | Hardcoded - should use semantic token |
| Gradient border | `from-gov-red via-gov-gold to-gov-red` | Uses custom gov tokens |

**Key Areas Needing Updates:**

1. **Line 10:** `bg-slate-50` → should use `bg-muted` or `bg-surface-secondary` semantic token
2. **Line 115:** `text-white` → should use `text-surface-foreground` or similar semantic token
3. **Line 129:** Gradient uses `gov-red` and `gov-gold` - verify if these are defined in design tokens

**Dependencies:**
- Uses cn() utility for class merging
- No component dependencies

---

### 3. mobile-nav.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/mobile-nav.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Nav background | `bg-card` | Semantic token ✓ |
| Nav border | `border-t` | Semantic token ✓ |
| Active text | `text-primary-600` | Semantic token ✓ |
| Inactive text | `text-muted-foreground` | Semantic token ✓ |
| Active indicator bar | `bg-primary-600` | Semantic token ✓ |

**Key Areas Needing Updates:**

1. **Line 28:** `pb-safe` - verify if this is a custom Tailwind class for safe area padding
2. All color tokens are already semantic - NO HARDCODED COLORS FOUND ✓

**Status:** This component is already well-aligned with semantic tokens. Minimal updates needed.

**Dependencies:**
- NavLink from react-router-dom
- Uses useAuth() hook
- Uses cn() utility

---

### 4. top-navbar.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/top-navbar.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Header background | `bg-card` | Semantic token ✓ |
| Header border | `border-b` | Semantic token ✓ |
| Menu button hover | `hover:bg-muted` | Semantic token ✓ |
| Notification badge | `bg-destructive` | Semantic token ✓ |
| User avatar background | `bg-primary-100` | Semantic token ✓ |
| User avatar icon | `text-primary-600` | Semantic token ✓ |
| Dropdown background | `bg-card` | Semantic token ✓ |
| Logout text | `text-destructive` | Semantic token ✓ |

**Key Areas Needing Updates:**

1. All color tokens are already semantic - NO HARDCODED COLORS FOUND ✓

**Status:** This component is already well-aligned with semantic tokens. No updates needed.

**Dependencies:**
- useAuth() hook
- Uses cn() utility
- Uses useState and useRef for dropdown management

---

### 5. sidebar.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/sidebar.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Sidebar background | `bg-card` | Semantic token ✓ |
| Sidebar border | `border-r` | Semantic token ✓ |
| Mobile overlay | `bg-black/50` | Hardcoded opacity - acceptable for overlays |
| Menu item hover | `hover:bg-muted` | Semantic token ✓ |
| Active menu item background | `bg-primary-50` | Semantic token ✓ |
| Active menu item text | `text-primary-700` | Semantic token ✓ |
| Active menu item icon | `text-primary-600` | Semantic token ✓ |
| Focus ring | `focus-visible:ring-primary-500` | Semantic token ✓ |

**Key Areas Needing Updates:**

1. All color tokens are already semantic - NO HARDCODED COLORS FOUND ✓
2. **Line 58:** `bg-black/50` is acceptable for overlay but could be `bg-overlay` if custom token exists

**Status:** This component is already well-aligned with semantic tokens. Minimal updates needed.

**Dependencies:**
- NavLink from react-router-dom
- NationalEmblem component
- useAuth() hook
- Uses cn() utility

---

### 6. breadcrumb.tsx

**File Path:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/breadcrumb.tsx`

**Current Styling Patterns:**

| Element | Current Style | Issue |
|---------|---------------|-------|
| Link text | `text-muted-foreground` | Semantic token ✓ |
| Link hover | `hover:text-primary-600` | Semantic token ✓ |
| Current page text | `text-primary-600` | Semantic token ✓ |
| Separator icon | `text-muted-foreground` | Semantic token ✓ |

**Key Areas Needing Updates:**

1. All color tokens are already semantic - NO HARDCODED COLORS FOUND ✓

**Status:** This component is already well-aligned with semantic tokens. No updates needed.

**Dependencies:**
- Uses cn() utility
- No external component dependencies

---

## Summary Table

| Component | File Path | Hardcoded Colors | Semantic Tokens | Priority |
|-----------|-----------|------------------|-----------------|----------|
| government-header | layout/government-header.tsx | bg-white, text-white | primary-600, muted-foreground | HIGH |
| government-footer | layout/government-footer.tsx | bg-slate-50, text-white | primary-600, muted-foreground | HIGH |
| mobile-nav | layout/mobile-nav.tsx | None | All semantic | LOW |
| top-navbar | layout/top-navbar.tsx | None | All semantic | LOW |
| sidebar | layout/sidebar.tsx | None (bg-black/50 acceptable) | All semantic | LOW |
| breadcrumb | layout/breadcrumb.tsx | None | All semantic | LOW |

---

## Hardcoded Colors Inventory

**Critical Updates Required:**

1. `bg-white` (2 occurrences)
   - government-header.tsx:17
   - Should map to: `bg-surface` or `bg-card`

2. `bg-slate-50` (1 occurrence)
   - government-footer.tsx:10
   - Should map to: `bg-muted` or `bg-surface-secondary`

3. `text-white` (2 occurrences)
   - government-header.tsx:60
   - government-footer.tsx:115
   - Should map to: `text-surface-foreground` or `text-primary-foreground`

4. `border-gov-red` (2 occurrences)
   - government-header.tsx:17
   - government-footer.tsx:10
   - Status: Verify if gov-red is defined in design tokens

5. `gov-gold` (1 occurrence)
   - government-footer.tsx:129
   - Status: Verify if gov-gold is defined in design tokens

---

## Custom Token Verification Needed

The following custom tokens are used but need verification in design token definitions:

- `gov-red` - Used in borders (government-header, government-footer)
- `gov-gold` - Used in gradient (government-footer)
- `pb-safe` - Used for safe area padding (mobile-nav)

**Action:** Check if these are defined in Tailwind config or CSS variables.

---

## Recommendations

### Phase 1: High Priority (government-header, government-footer)

1. Replace `bg-white` with semantic token (likely `bg-card` or `bg-surface`)
2. Replace `bg-slate-50` with semantic token (likely `bg-muted`)
3. Replace `text-white` with semantic token (likely `text-primary-foreground`)
4. Verify `gov-red` and `gov-gold` tokens exist in design system

### Phase 2: Verification

1. Confirm all custom tokens (gov-red, gov-gold, pb-safe) are properly defined
2. Test components with new semantic tokens
3. Ensure consistency across all layout components

### Phase 3: Documentation

1. Update design token documentation with gov-red and gov-gold definitions
2. Create component styling guide for layout components
3. Document safe area padding implementation

---

## Files to Update

**High Priority:**
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/government-header.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/components/layout/government-footer.tsx`

**Verification Required:**
- Tailwind config file (check for gov-red, gov-gold, pb-safe definitions)
- CSS variables file (if using CSS custom properties)
- Design tokens documentation

---

## Next Steps

1. Locate and review design token definitions
2. Create mapping document for hardcoded colors to semantic tokens
3. Plan implementation updates for government-header and government-footer
4. Test all components with updated tokens
5. Update component documentation

