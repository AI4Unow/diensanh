---
title: "UI Test Plan"
description: "Comprehensive UI test plan covering Public Portal, Authentication, Admin Interface, and Village Leader Interface using Chrome DevTools scripts."
status: pending
priority: P2
effort: 4h
branch: master
tags: [ui-test, qa, playwright, chrome-devtools]
created: 2026-01-16
---

# UI Test Plan

## 1. Overview
This plan outlines the strategy for UI testing the Diensanh application using `chrome-devtools` skill scripts. The goal is to verify the visual layout, key elements, and basic functionality of the Public Portal, Authentication flows, Admin Interface, and Village Leader Interface.

## 2. Test Strategy
We will use a script-based approach to automate browser interactions and screenshot capture.

*   **Tools**: `chrome-devtools` skill scripts (`navigate.js`, `screenshot.js`).
*   **Authentication**: `inject-auth.js` will be used to bypass login forms for protected routes (Admin & Village Leader dashboards).
*   **Verification**: Visual inspection of screenshots and script execution logs to ensure page loads and element presence.
*   **Environment**: Local development environment (`localhost:5173`) or Preview URL.

## 3. Test Scope

### Phase 1: Public Portal Tests
Target Audience: Citizens/Public Users.
No authentication required.

| Page | Route | Key Elements to Verify |
| :--- | :--- | :--- |
| **Home** | `/` | Hero section, Navigation menu, Quick links. |
| **Announcements** | `/portal/announcements` | List of announcements, Search/Filter bar, Pagination (if applicable). |
| **Request Form** | `/portal/request-form` | Input fields (Name, Phone, Request type), Submit button, Validation messages. |
| **Chatbot** | `/portal/chatbot` | Chat interface, Input area, Send button, Initial greeting. |

### Phase 2: Authentication Tests
Target Audience: All users.

| Flow | Route | Key Elements to Verify |
| :--- | :--- | :--- |
| **Login Page** | `/login` | Username/Password fields, Login button, "Forgot Password" link. |
| **Login Success** | `/login` -> `/admin/dashboard` | successful redirection after valid credentials (simulated or actual). |

### Phase 3: Admin Interface Tests
Target Audience: System Administrators.
**Requires Authentication** (Role: Admin).

| Page | Route | Key Elements to Verify |
| :--- | :--- | :--- |
| **Dashboard** | `/admin/dashboard` | Statistics cards, Recent activity feed, Navigation sidebar. |
| **Villages** | `/admin/villages` | List of villages, "Add Village" button, Village details view. |
| **Households** | `/admin/households` | Search bar, List of households, "Add Household" button. |
| **SMS** | `/admin/sms` | Compose message modal/form, Sent history list. |
| **Tasks** | `/admin/tasks` | Task board/list, "Create Task" button, Status filters. |

### Phase 4: Village Leader Interface Tests
Target Audience: Village Leaders.
**Requires Authentication** (Role: Village Leader).

| Page | Route | Key Elements to Verify |
| :--- | :--- | :--- |
| **Dashboard** | `/village/dashboard` | Village-specific stats, Resident overview, Quick actions. |

## 4. Implementation Steps

### Step 1: Environment Setup
1.  Ensure local server is running (`npm run dev`).
2.  Verify `chrome-devtools` scripts are available (`navigate.js`, `screenshot.js`, `inject-auth.js`).

### Step 2: Script Preparation
1.  Create/Update `inject-auth.js` to handle `localStorage` or cookie-based auth tokens for Admin and Village Leader roles.
2.  Prepare a list of target URLs.

### Step 3: Execution - Public Portal
1.  Run `navigate.js` and `screenshot.js` for all Public Portal routes.
2.  Store screenshots in `plans/reports/screenshots/public/`.

### Step 4: Execution - Admin Interface
1.  Execute `inject-auth.js` with Admin credentials.
2.  Run `navigate.js` and `screenshot.js` for all Admin routes.
3.  Store screenshots in `plans/reports/screenshots/admin/`.

### Step 5: Execution - Village Leader Interface
1.  Execute `inject-auth.js` with Village Leader credentials.
2.  Run `navigate.js` and `screenshot.js` for Village Leader routes.
3.  Store screenshots in `plans/reports/screenshots/village/`.

### Step 6: Analysis & Reporting
1.  Review all screenshots for visual defects (layout issues, broken images, missing styles).
2.  Compile findings into a summary report.

## 5. Deliverables
*   **Test Report**: `plans/reports/ui-test-report.md` containing:
    *   Execution status (Pass/Fail).
    *   Links to captured screenshots.
    *   Identified issues (Visual bugs, Functional errors).
*   **Screenshots**: Organized folder of screenshots for all tested pages.

## 6. Unresolved Questions
*   Do we have valid test credentials for Admin and Village Leader roles?
*   Is the backend data seeded for the Admin/Village views to be populated?
