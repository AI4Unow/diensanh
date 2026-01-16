---
title: "UI/UX Polish & Quick Wins"
description: "Enhance typography, colors, and interactions for Vietnamese government commune app"
status: pending
priority: P1
effort: 4h
branch: feat/ui-ux-polish-quickwins
tags: [ui, ux, design-system, accessibility, vietnamese]
created: 2026-01-16
---

# UI/UX Polish & Quick Wins Implementation Plan

## Overview

Polish existing design system with Vietnamese-optimized typography, government-official colors, and micro-interactions. Focus on quick wins with high UX impact.

## Research References

- [Color & Typography Research](research/researcher-01-color-typography.md)
- [Interactions & Loading Research](research/researcher-02-interactions-loading.md)

## Key Files

- `web/src/styles/globals.css` - Design tokens
- `web/index.html` - Font preload
- `web/src/components/dashboard/stats-card.tsx` - Hover states
- `web/src/components/auth/login-form.tsx` - Loading buttons

## Phases

| Phase | Title | Status | Effort | Priority |
|-------|-------|--------|--------|----------|
| 1 | [Typography & Fonts](phase-01-typography-fonts.md) | pending | 45min | P0 |
| 2 | [Color Token Refinement](phase-02-color-tokens.md) | pending | 45min | P1 |
| 3 | [Micro-interactions](phase-03-micro-interactions.md) | pending | 90min | P1 |
| 4 | [Quick UX Fixes](phase-04-quick-ux-fixes.md) | pending | 30min | P2 |

## Dependencies

- Google Fonts CDN (Be Vietnam Pro)
- No new npm packages required

## Success Criteria

- [ ] Be Vietnam Pro font loads with swap strategy
- [ ] Line height 1.6 applied globally for Vietnamese text
- [ ] All buttons show loading spinner when pending
- [ ] Cards have hover states without layout shift
- [ ] Interactive elements have cursor-pointer
- [ ] Focus states visible (ring-2)

## Risk Assessment

- **Low risk**: All changes are additive CSS/token updates
- **No breaking changes**: Existing components continue working
- **Rollback**: Revert globals.css if issues arise

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 5

### Confirmed Decisions

| Decision | User Choice |
|----------|-------------|
| Font source | Google Fonts CDN |
| Color format | **OKLCH** (differs from plan - update Phase 2) |
| Target users | Non-technical commune workers (elderly) - **18px base font** |
| Loading pattern | **TanStack Query mutations** (differs from plan - update Phase 3) |
| Scope | Listed components only |

### Action Items (Plan Updates Required)

- [x] **Phase 1:** Change base font to 18px (from 16px) for elderly users
- [x] **Phase 2:** Convert HEX colors to OKLCH format
- [x] **Phase 3:** Update loading pattern to use TanStack Query mutations instead of local state
- [x] **Phase 4:** Increase touch targets for elderly users (min 48px)
