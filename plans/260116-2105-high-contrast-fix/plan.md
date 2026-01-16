---
title: "Update Color System for Accessibility"
description: "Increase contrast of muted text and secondary colors to meet WCAG AA/AAA standards"
status: pending
priority: P1
effort: 1h
branch: master
tags: [accessibility, ui, css]
created: 2026-01-16
---

# Plan: High Contrast Color Updates

## Context
Research indicates that the current "muted" and "secondary" text colors are too light for elderly users or those with visual impairments. We need to darken these colors to ensure they meet WCAG accessibility standards (at least 4.5:1 for normal text).

## Objectives
- Update global CSS variables for muted and secondary text to be darker.
- Verify usage in key components (`ContactInfoCard`, `HeroSection`).
- Ensure no hardcoded low-contrast values remain in critical paths.

## 1. Global CSS Updates (`web/src/styles/globals.css`)
We will update the following CSS variables to higher contrast values.

| Variable | Current Value | New Value | Notes |
|----------|---------------|-----------|-------|
| `--color-muted-foreground` | `#64748b` (Slate 500) | `#334155` (Slate 700) | Much better contrast against white. |
| `--color-text-secondary` | `oklch(40% 0.05 240)` | `oklch(25% 0.04 240)` | Matches closer to primary text but slightly softer. |

**Action:**
- Edit `web/src/styles/globals.css`.

## 2. Component Review & Overrides
Check specific components to ensure they use the updated variables or override if necessary.

### `web/src/components/portal/contact-info-card.tsx`
- **Current:** Uses `text-muted-foreground` for labels ("Địa chỉ:", etc.).
- **Impact:** With the global change, these will automatically become `#334155`. This is desirable.
- **Action:** Verify no other hardcoded gray classes (e.g., `text-gray-400`) are used. (Scan showed none, just `text-muted-foreground`).

### `web/src/components/portal/hero-section.tsx`
- **Current:** Uses `text-muted-foreground` for search icon and "Tìm kiếm phổ biến".
- **Impact:** These will also darken.
- **Action:** Ensure the placeholder text contrast in the search input is sufficient. (Standard browser placeholders are often light; we might need `placeholder:text-gray-500` or darker if default is too light).

## 3. Tailwind Configuration Verification
- Since we are using Tailwind v4 with CSS variables defined in `@theme`, we don't need to check `tailwind.config.ts` for these specific mappings as they are native CSS variable mappings.
- **Action:** Double check `web/src/styles/globals.css` to ensure `text-muted-foreground` maps correctly to the variable (it seems to be doing so via standard utility mapping or explicit definition if needed, but standard Tailwind usually relies on `color-` naming conventions in v4).

## 4. Verification Steps
1.  **Build:** Run `npm run build` to ensure CSS compiles correctly.
2.  **Visual Check:**
    - Open the portal homepage.
    - Check the "Thông tin liên hệ" card.
    - Check the "Tìm kiếm phổ biến" text.
    - Verify they are significantly darker and easier to read.
