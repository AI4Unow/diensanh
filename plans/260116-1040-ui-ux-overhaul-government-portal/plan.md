---
title: "UI/UX Overhaul - Government Portal Redesign"
description: "Comprehensive UI/UX redesign for elderly-friendly Vietnamese government portal"
status: pending
priority: P1
effort: 20h
branch: master
tags: [ui-ux, accessibility, government, frontend]
created: 2026-01-16
---

# UI/UX Overhaul - Government Portal Redesign

## Objective
Transform Dien Sanh commune portal into an elderly-friendly, WCAG AAA-compliant government portal with official Vietnamese branding, optimized for rural users on budget Android devices.

## Target Audience
- Rural Vietnamese citizens (40-70+ years)
- Low-tech literacy, budget Android phones, slow connections

## Key Changes
- Primary color: `#1d4ed8` -> `#004A99` (Government Blue)
- Add National Emblem, official red/gold accents
- Touch targets: 48-56px minimum
- High contrast: 7:1 ratio (WCAG AAA)
- Mobile-first with bottom navigation

## Phases

| Phase | Focus | Effort | Status |
|-------|-------|--------|--------|
| [Phase 1](./phase-01-design-system-foundation.md) | Design tokens, colors, typography | 3h | pending |
| [Phase 2](./phase-02-core-layout-components.md) | Header, footer, emblem integration | 4h | pending |
| [Phase 3](./phase-03-portal-homepage-redesign.md) | Public portal homepage | 3h | pending |
| [Phase 4](./phase-04-login-auth-flow.md) | Login & authentication UX | 2h | pending |
| [Phase 5](./phase-05-admin-dashboard.md) | Admin dashboard enhancement | 4h | pending |
| [Phase 6](./phase-06-mobile-navigation.md) | Mobile nav & touch optimization | 2h | pending |
| [Phase 7](./phase-07-accessibility-audit.md) | Accessibility audit & polish | 2h | pending |

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 6

### Confirmed Decisions
| Decision | User Choice |
|----------|-------------|
| Primary Color | Government Blue #004A99 |
| Mobile Navigation | 4 items + "More" page pattern |
| Layout System | Split (portal vs admin) |
| Accessibility Level | WCAG AAA (7:1 contrast) |
| Phase Priority | All 7 phases |

### Assets Provided
- **Banner Image**: `/Users/nad/Downloads/bannner-xa-dien-sanh.jpg` (user-provided, extract emblem/branding from this)

### Action Items
- [ ] Extract national emblem and branding from user-provided banner image
- [ ] Convert banner assets to optimized SVG/WebP formats

## Key Dependencies
- Banner image asset (user-provided: bannner-xa-dien-sanh.jpg)
- Be Vietnam Pro font (already configured)
- shadcn/ui components (existing)

## Research Reports
- [Government Portal UX Standards](./research/researcher-01-gov-portal-ux-standards.md)
- [React + Tailwind Patterns](./research/researcher-02-react-tailwind-patterns.md)

## Success Metrics
- Lighthouse Accessibility Score: >=90
- Touch target audit: 100% >=48px
- Contrast ratio audit: 100% >=7:1
- Mobile usability test with elderly users (qualitative)
