---
title: "Body-Theme Matching"
description: "Match body section colors with header banner for visual cohesion"
status: pending
priority: P1
effort: 2.5h
branch: master
tags: [ui, styling, accessibility, gov-standards]
created: 2026-01-16
---

# Body-Theme Matching Implementation Plan

## Problem
Body section uses dark navy gradient (`from-primary-600 via-primary-700 to-primary-800`) which clashes with header banner's sky-blue/white/deep-blue gradient.

## Solution
Align body with Vietnamese gov portal standards (reference: diensanh.quangtri.gov.vn):
- Light theme with dark text (like official gov site)
- Light gray body background (#F5F5F5)
- White content cards
- Navy accent (#1A237E) for headings (validated)
- WCAG AAA contrast compliance

## Research Insights
- **Gov Standard**: Circular 22/2023/TT-BTTTT mandates consistent header-body transitions
- **Reference**: chinhphu.vn uses white header + light gray (#F5F5F5) body
- **Banner Colors**: Red #D32F2F (main text), Navy #1A237E (subtitle), Sky blue gradient
- **Contrast**: 4.5:1 minimum for normal text per WCAG 2.1/2.2

## Phase Overview

| Phase | File | Status | Est. |
|-------|------|--------|------|
| 1 | [Update Color Tokens](./phase-01-update-color-tokens.md) | pending | 45m |
| 2 | [Update Hero Section](./phase-02-update-hero-section.md) | pending | 45m |
| 3 | [Update Portal-Wide Components](./phase-03-portal-wide-updates.md) | pending | 30m |

## Key Files
- `web/src/styles/globals.css` - CSS tokens
- `web/src/components/portal/hero-section.tsx` - Hero styling
- `web/src/components/portal/quick-access-card.tsx` - Card styling
- `web/src/components/portal/contact-info-card.tsx` - Contact card
- `web/src/components/layout/portal-layout.tsx` - Layout wrapper

## Dependencies
- None (standalone styling changes)

## Success Criteria
- Body visually cohesive with header banner
- Light gray body (#F5F5F5) with white cards
- Navy accent (#1A237E) on "Xin chào!" heading (validated)
- WCAG AAA contrast (4.5:1+) for all text
- No dark navy gradients in body sections
- Full site consistency across all portal pages

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 3

### Confirmed Decisions
- **Theme approach**: Light theme with dark text (matches diensanh.quangtri.gov.vn)
- **Accent color**: Navy #1A237E for "Xin chào!" (not red)
- **Scope**: Full site consistency (all portal pages, not just hero)

### Action Items
- [x] Updated plan to use navy accent instead of red
- [x] Added Phase 3 for portal-wide component updates
- [x] Create phase-03-portal-wide-updates.md
