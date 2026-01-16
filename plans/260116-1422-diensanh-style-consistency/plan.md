---
title: "Diensanh Style Consistency Implementation"
description: "Apply target website styles to web app for visual consistency"
status: pending
priority: P2
effort: 8h
branch: main
tags: [styling, tailwind, accessibility, design-system]
created: 2026-01-16
---

# Diensanh Style Consistency Plan

## Context
- [Research: Target Website Styles](./research/researcher-01-website-styles.md)
- [Research: Current App Styles](./research/researcher-02-current-styles.md)

## Overview

Align web app styling with diensanh.quangtri.gov.vn for visual consistency. Key changes: update color palette (navy #1E3A8A vs current #004A99), remove legacy CSS, standardize tokens, create reusable components.

## Current State
- Tailwind v4 with @theme directive in globals.css
- 24 components using cn() helper
- Legacy index.css/App.css (unused but polluting workspace)
- Inconsistent color tokens (primary-* vs gov-* mixing)
- Hardcoded colors (green-600, red-600) instead of semantic tokens

## Target State
- Commune banner at top of public pages
- Single consolidated CSS file (globals.css)
- Unified color system matching target website
- Reusable Button/Input/Card components
- WCAG AAA compliance throughout

## Phases

| Phase | Description | Status | Effort |
|-------|-------------|--------|--------|
| [Phase 1](./phase-01-cleanup-legacy-css.md) | Remove legacy Vite CSS | pending | 30m |
| [Phase 2](./phase-02-update-color-tokens.md) | Update color palette | pending | 1h |
| [Phase 3](./phase-03-update-typography.md) | Ensure typography matches | pending | 45m |
| [Phase 4](./phase-04-create-component-library.md) | Create Button/Input/Card | pending | 2h |
| [Phase 5](./phase-05-update-layout-components.md) | Add banner + update header/nav | pending | 1.5h |
| [Phase 6](./phase-06-apply-visual-effects.md) | Shadows, borders, focus | pending | 1h |
| [Phase 7](./phase-07-accessibility-validation.md) | WCAG AAA validation | pending | 1.25h |

## Key Dependencies
- Phase 2 must complete before Phase 4-6 (components need updated tokens)
- Phase 4 should complete before Phase 5 (layouts use base components)

## Success Criteria
- No legacy CSS files remain
- All components use semantic color tokens
- WCAG AAA contrast ratios verified
- Visual parity with target website

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 5

### Confirmed Decisions
1. **Primary color:** Change from #004A99 → #1E3A8A (navy blue)
2. **gov-gold fix:** Add both colors - gov-gold (#FFCD00) + gov-red (#D42131) properly named
3. **Component library:** Create Button/Input/Card + refactor existing components
4. **Header style:** Navy header with red accent bar (matches gov websites)
5. **Legacy CSS:** Delete index.css + App.css
6. **Commune banner:** Add banner image at top of public pages

### Action Items
- [ ] Update Phase 2: Add gov-red token (#D42131), rename current gov-gold to gov-red
- [ ] Update Phase 2: Add new gov-gold token (#FFCD00) for focus rings
- [x] Update Phase 5: Add banner download and component creation steps
