---
title: "Agent-Browser Website Testing"
description: "Comprehensive E2E testing for Diensanh PWA using agent-browser CLI"
status: pending
priority: P1
effort: 12h
branch: main
tags: [testing, e2e, agent-browser, automation]
created: 2026-01-16
---

# Agent-Browser Website Testing Plan

## Overview

Implement E2E tests for all 23 routes using agent-browser CLI. Focus on critical user journeys across 3 roles: public, commune_admin, village_leader.

## Research

- [Agent-Browser Patterns](./research/researcher-01-agent-browser-patterns.md)
- [Frontend Analysis](./research/researcher-02-frontend-analysis.md)

## Phases

| # | Phase | Priority | Effort | Status |
|---|-------|----------|--------|--------|
| 1 | [Setup & Infrastructure](./phase-01-setup-infrastructure.md) | P1 | 1h | pending |
| 2 | [Public Portal Tests](./phase-02-public-portal-tests.md) | P1 | 2h | pending |
| 3 | [Authentication Tests](./phase-03-authentication-tests.md) | P1 | 2h | pending |
| 4 | [Admin CRUD Tests](./phase-04-admin-crud-tests.md) | P1 | 3h | pending |
| 5 | [SMS Campaign Tests](./phase-05-sms-campaign-tests.md) | P2 | 1h | pending |
| 6 | [Village Leader Tests](./phase-06-village-leader-tests.md) | P2 | 1h | pending |
| 7 | [Visual Regression](./phase-07-visual-regression.md) | P3 | 1h | pending |
| 8 | [CI/CD Integration](./phase-08-cicd-integration.md) | P2 | 1h | pending |

## Key Dependencies

- `agent-browser` CLI installed globally
- Dev server running at `http://localhost:5173`
- Firebase emulators (optional, for auth mocking)

## Test Coverage Target

- 23 routes covered
- 4 critical forms tested
- 3 role-based auth flows validated
- Visual baselines for key pages

## Success Criteria

- All phases completed with passing tests
- Test scripts executable in CI/CD
- Documentation for running tests locally

## Validation Summary

**Validated:** 2026-01-16
**Questions asked:** 5

### Confirmed Decisions

| Decision | User Choice |
|----------|-------------|
| OTP handling | Code bypass (dev mode) - Add dev-only bypass in auth-context.tsx |
| Test scope | Full coverage - All 23 routes including admin CRUD, SMS, village leader |
| CI/CD platform | Vercel checks - Use Vercel's native testing hooks |
| Credentials management | Environment variables - Pass via env vars at runtime |
| Visual regression | Full visual regression - Capture baselines, compare, fail on diff |

### Action Items

- [ ] Update Phase 3: Replace Firebase emulator approach with code bypass
- [ ] Update Phase 7: Ensure full visual regression with baseline comparison
- [ ] Update Phase 8: Change from GitHub Actions to Vercel checks
- [ ] Add env vars for test accounts: `TEST_ADMIN_PHONE`, `TEST_VILLAGE_PHONE`

### Resolved Questions

1. ✅ OTP handling → Code bypass in dev mode
2. ⬜ Session cleanup → Still needs decision (recommend cleanup.sh after each run)
3. ⬜ Parallel execution → Defer to implementation (Vercel may limit)
