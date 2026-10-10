# SINERGI — Overnight Engineering Lab Report

**Project:** SINERGI (Sistem Integrasi Ekstrakurikuler dan Organisasi)  
**Target Release:** Release Candidate v1.0.0-rc1  
**Shift Date:** 2026-10-07 / 2026-10-08  
**Operating Mode:** Autonomous Controlled Engineering Shift (Zero Direct Commits to Main, Zero Self-Merges)

---

## 1. Baseline Verification (Task 0)
- **Base Branch:** `master`
- **Initial Commit:** `ba08fd6` ("fix(timezone): configure Asia/Jakarta WIB timezone and format scan feedback with WIB")
- **Automated Tests:** 65 passed (205 assertions) in 15.87s
- **Frontend Build:** Vite v7.3.7 succeeded cleanly in 15.68s
- **Code Style (Pint):** Passed (`{"tool":"pint","result":"passed"}`)

---

## 2. Completed Branches & Pull Requests

| Task | Branch Name | Commit SHA | Pull Request URL | Status |
|---|---|---|---|---|
| **Visual Identity Reset** | `design/visual-identity-reset` | `f4c7288` | [PR #1](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/1) | Open |
| **Task 1: Logout / Browser Cache Security** | `hardening/logout-cache` | `47eb964` | [PR #2](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/2) | Open |
| **Task 2: Timezone Consistency & QR Rollover** | `hardening/timezone-consistency` | `da5b932` | [PR #3](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/3) | Open |
| **Task 3: PWA Cache Security** | `hardening/pwa-cache-security` | `e67152a` | [PR #4](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/4) | Open |
| **Task 4: Automated UAT Integration** | `test/automated-uat` | `c2a936b` | [PR #5](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/5) | Open |
| **Task 5: Accessibility (WCAG 2.1 AA)** | `quality/accessibility` | `b1f8246` | [PR #6](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/6) | Open |
| **Task 6: Query Performance Optimization** | `perf/rc1-optimization` | `6c04492` | [PR #7](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/7) | Open |
| **Task 7: Extracurricular Analytics (Experimental)** | `feature/attendance-analytics` | `e3a3751` | [PR #8](https://github.com/ZidnyAl-HikamMawarist/sinergi/pull/8) | Open |

**Skipped Branches:** None. All 7 tasks completed.

---

## 3. Vulnerability Findings & Fixes

### 1. Browser bfcache & Post-Logout Stale Data Exposure (PR #2)
- **Discovery:** When logging out on shared school lab computers, pressing the browser "Back" button visually re-rendered authenticated dashboards from browser memory / back-forward cache (bfcache).
- **Fix:**
  - Implemented `PreventBackHistory` middleware injecting `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` and `Pragma: no-cache` for all authenticated and protected paths.
  - Injected `Clear-Site-Data: "cache"` on the logout redirect response.
  - Added `pageshow` listener in `app.blade.php` that detects `event.persisted` and immediately reloads the page to trigger an instantaneous 302 redirect to `/login`.
  - Regression coverage: `LogoutBrowserCacheSecurityTest` (3 passed, 17 assertions).

### 2. Service Worker Indiscriminate Private Data Caching (PR #4)
- **Discovery:** `public/sw.js` cached all successful GET responses (`sinergi-cache-v1`), including private student records, ledger balances, and audit logs into client `CacheStorage`.
- **Fix:**
  - Upgraded service worker to `sinergi-cache-v2`.
  - Enforced strict **Network-Only** policy for protected prefixes (`portal/*`, `eskul/*`, `kas/*`, `admin/*`, `workspace/*`, `password/*`, `attendance/*`) and Inertia JSON partial requests (`X-Inertia`).
  - Added static unprivileged offline fallback page (`public/offline.html`).
  - Added `CLEAR_USER_DATA` message handler invoked upon logout in `AppLayout.jsx`.
  - Regression coverage: `PwaCacheSecurityTest` (3 passed, 14 assertions).

### 3. Timezone Invariance & Midnight Boundary Skew (PR #3)
- **Discovery:** Local device timezone offsets could lead to confusing time displays (e.g. UTC vs WIB) and midnight roll-overs needed explicit invariance testing.
- **Fix:**
  - Documented ADR 006 (Timezone & Temporal Consistency).
  - Maintained pure Unix epoch seconds inside dynamic QR cryptographic payloads, guaranteeing mathematical invariance across midnight and calendar transitions.
  - Shared `appTimezone` with client via `HandleInertiaRequests` and created `resources/js/Utils/date.js` ensuring all frontend dates consistently display in `Asia/Jakarta` with "WIB" suffix.
  - Regression coverage: `TimezoneConsistencyTest` (4 passed, 8 assertions).

---

## 4. Quality, Testing & Accessibility Improvements

### 1. Automated Multi-Role UAT Lifecycle (PR #5)
- Automated end-to-end user journeys without requiring external browser drivers:
  - **ADMIN:** Login → dashboard → student directory → extracurricular index.
  - **STUDENT:** Login → mandatory password change enforcement → password change submission → portal dashboard → fresh dynamic QR generation.
  - **PENGURUS:** Login → session creation → student QR attendance scan → recap dashboard → session close.
  - **BENDAHARA:** Login → income transaction creation with receipt proof upload → storage verification → ledger dashboard → transaction void with audited reason.
  - **SECURITY:** Protected dashboard access → logout → browser back navigation simulation → redirect to login.
- Coverage: `AutomatedUatTest` (5 passed, 58 assertions).

### 2. WCAG 2.1 AA Accessibility Standards (PR #6)
- **Input (`Input.jsx`):** Generated unique IDs (`useId`), added `aria-describedby` pointing to error/helper texts, added `aria-invalid`, and added `role="alert"` for form validation errors.
- **Modal (`Modal.jsx`):** Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label="Tutup dialog"` for close button.
- **Button (`Button.jsx`):** Added `aria-busy` and `aria-disabled` for loading states; hidden decorative spinner icons via `aria-hidden="true"`.
- **Layout (`AppLayout.jsx`):** Added accessible skip-to-content anchor (`#main-content`), `aria-expanded` and `aria-label` for mobile hamburger and profile dropdown.
- Coverage: `AccessibilityTest` (2 passed, 4 assertions).

---

## 5. Performance Optimizations (PR #7)

### Cash Dashboard Query Consolidation
- **BEFORE:** 5 separate SQL queries sequentially executed per visit to calculate `balance`, `totalIn`, `totalOut`, `validCount`, and `voidCount`.
- **CHANGE:** Consolidated into a single conditional SQL aggregation query using `selectRaw("COALESCE(SUM(CASE WHEN ...), 0)")`.
- **AFTER:** 1 single query. 80% reduction in query roundtrips on the cash ledger dashboard.

### Active Academic Year Enrollment Scoping
- **BEFORE:** Unconstrained eager loading of `user.enrollments.schoolClass` in `AttendanceRecapController` and `EskulMemberController`.
- **CHANGE:** Scoped enrollments eager loading with `fn ($q) => $q->where('academic_year_id', $yearId)`.
- **AFTER:** Avoids hydrating historical class records from past academic years, reducing memory footprint and preventing class name mismatches.

---

## 6. Experimental Feature: Extracurricular Analytics (PR #8)
- Route: `/eskul/analytics`
- Computes aggregate attendance percentages, recent session attendance trends, and three-tier member participation distribution:
  - High Participation (≥ 80%)
  - Moderate Participation (50% - 79%)
  - Needs Attention (< 50%)
- Built with zero gradients, zero purple, conforming strictly to the institutional design system.
- Regression coverage: `AttendanceAnalyticsTest` (2 passed, 8 assertions).

---

## 7. Merge Recommendations

### Strongly Recommended to Merge (Core Security & Reliability)
1. **PR #2 (`hardening/logout-cache`):** Critical security fix for shared school workstations.
2. **PR #4 (`hardening/pwa-cache-security`):** Critical PWA data leakage prevention.
3. **PR #3 (`hardening/timezone-consistency`):** Eliminates timezone ambiguity across school devices.
4. **PR #5 (`test/automated-uat`):** Essential CI/CD safety net for regression prevention.
5. **PR #6 (`quality/accessibility`):** Necessary for institutional WCAG 2.1 AA compliance.
6. **PR #7 (`perf/rc1-optimization`):** Pure non-breaking database query efficiency win.

### Subject to Review / Stakeholder Preference
1. **PR #1 (`design/visual-identity-reset`):** Full visual identity reset (reviewed together per user instructions).
2. **PR #8 (`feature/attendance-analytics`):** Optional experimental analytics dashboard. Non-breaking, can be merged whenever leadership wants analytics exposed to officers.

### PRs That Should NOT Be Merged
- None of the PRs are rejected. All 8 PRs are isolated, independently tested, and maintain 100% test pass rate with zero regressions.

---

## 8. Unresolved Issues / Human Review Required
- Upstream GitHub Incident: GitHub experienced transient `remote: Internal Server Error` during the shift on their git operations cluster (October 7 incident), which subsequently recovered. All branches and PRs #1 through #8 are successfully hosted on remote.
- Production camera permissions: Physical camera video stream scanning for QR attendance requires HTTPS in production (already enforced in RC1 via trusted proxy configuration).
