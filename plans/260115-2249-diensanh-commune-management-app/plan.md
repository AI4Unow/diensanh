---
title: "Dien Sanh Commune Management App"
description: "Full-stack PWA for commune administration with offline support, SMS notifications, and multi-role access"
status: pending
priority: P1
effort: 122h
branch: main
tags: [pwa, firebase, react, typescript, commune-management, vietnam]
created: 2026-01-15
---

# Dien Sanh Commune Management App - Implementation Plan

## Overview
Build comprehensive PWA for UBND xa Dien Sanh (Hai Lang, Quang Tri) with:
- Multi-role access (Commune Admin, Village Leader, Public)
- Offline-first architecture for rural connectivity
- SMS provider abstraction (VNPT/eSMS/Stringee)
- Firebase Auth (phone OTP), Firestore database
- Integration with existing Python/FastAPI RAG chatbot

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| State | Zustand + React Query |
| Backend | Existing FastAPI + New Firebase Functions |
| Database | Firestore (with offline persistence) |
| Auth | Firebase Auth (phone OTP) |
| PWA | vite-plugin-pwa + Workbox |
| SMS | Provider abstraction layer |

## Administrative Structure
- 18 thon + 2 KDC = 20 villages total
- 3 former regions: Dien Sanh cu (11), Hai Truong (5), Hai Dinh (4)

---

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 01 | Foundation & Auth Setup | pending | 14h | [phase-01](./phase-01-foundation-auth-setup.md) |
| 02 | Firestore Schema & Security Rules | pending | 10h | [phase-02](./phase-02-firestore-schema-security.md) |
| 03 | Admin Dashboard & Navigation | pending | 14h | [phase-03](./phase-03-admin-dashboard-navigation.md) |
| 04 | Village Management Module | pending | 12h | [phase-04](./phase-04-village-management.md) |
| 05 | Household & Resident Management | pending | 16h | [phase-05](./phase-05-household-resident-management.md) |
| 06 | SMS Messaging System | pending | 14h | [phase-06](./phase-06-sms-messaging-system.md) |
| 07 | Task Assignment Module | pending | 10h | [phase-07](./phase-07-task-assignment.md) |
| 08 | Public Portal & Chatbot Integration | pending | 12h | [phase-08](./phase-08-public-portal-chatbot.md) |
| 09 | PWA & Offline Support | pending | 12h | [phase-09](./phase-09-pwa-offline-support.md) |
| 10 | Testing & Deployment | pending | 8h | [phase-10](./phase-10-testing-deployment.md) |

---

## Key Dependencies
1. Firebase project configured (`diensanh-37701`)
2. SMS provider API credentials (brandname registration pending)
3. Existing FastAPI backend operational
4. Village/household data from commune

## Research Reports
- [PWA/Offline Architecture](./research/researcher-01-pwa-offline-patterns.md)
- [SMS Provider Abstraction](./research/researcher-02-sms-api-abstraction.md)

## Unresolved Questions
1. Brandname registration timeline with MIC?
2. VNeID integration requirements/timeline?
3. Existing household data format for import?
4. Commune admin contact for UAT?

---

## Validation Summary

**Validated:** 2026-01-15
**Questions asked:** 8

### Confirmed Decisions
| Decision | Choice |
|----------|--------|
| UI Framework | TailwindCSS + shadcn/ui + ui-ux-pro-max skill |
| State Management | Zustand (confirmed) |
| SMS Permission | Commune admin only |
| CCCD Storage | Encrypt in Firestore |
| Web Hosting | Vercel |
| Backend Hosting | Cloud Run |
| Rollout Strategy | Full rollout immediately (all 20 villages) |
| Data Backup | Firestore scheduled exports |

### Action Items
- [x] Update Phase 01: Add shadcn/ui to dependencies
- [x] Update Phase 02: Add CCCD encryption logic
- [x] Update Phase 06: Restrict SMS to commune_admin role only
- [x] Update Phase 10: Change hosting from Firebase Hosting to Vercel
- [x] Update Phase 10: Add Cloud Run deployment for FastAPI
