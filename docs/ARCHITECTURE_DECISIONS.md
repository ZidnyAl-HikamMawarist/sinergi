# Architecture Decision Records (ADR) — SINERGI

## ADR 001: Frontend Stack — React 19 with Inertia.js v2 and Tailwind CSS 4
- **Status:** Accepted
- **Context:** PRD and Master Protocol specify a modern, reactive, mobile-first PWA interface using React, Inertia.js, and Tailwind CSS without downgrading Laravel 13 or Tailwind 4.
- **Decision:** Install `inertiajs/inertia-laravel` on backend and `@inertiajs/react`, `react`, `react-dom`, `@vitejs/plugin-react` on frontend. Maintain `@tailwindcss/vite` within `vite.config.js`.
- **Consequences:** Eliminates API duplication for internal views while giving rich SPA interactivity and instant page transitions.

## ADR 002: Dynamic QR Token Protocol
- **Status:** Accepted
- **Context:** PRD Section 8 requires dynamic QR with 60-second validity, ±15s tolerance, replay prevention, and cryptographic integrity.
- **Decision:** Token payload format: JSON string base64url encoded containing `uuid` (student UUID), `exp` (timestamp in seconds), and `sig` (HMAC-SHA256 signature using `APP_KEY`). Consumed token hashes stored in `qr_token_uses` table.
- **Consequences:** Prevents screenshot sharing, prevents replays, server validates authentic session and membership before marking attendance.

## ADR 003: Immutable Cash Register Architecture
- **Status:** Accepted
- **Context:** PRD Section 7.E and ERD Section 4 require absolute immutability of cash records (anti-manipulasi).
- **Decision:** No update or destroy endpoints exist for `cash_transactions`. Edits are strictly forbidden. Corrections occur exclusively through a `void` transition requiring `void_reason`, recording `voided_by` and `voided_at`, followed by a new transaction if necessary. Current balance is always calculated server-side.
- **Consequences:** Provides full financial accountability and audit trail.

## ADR 004: Academic Year Scoping
- **Status:** Accepted
- **Context:** Students, classes, extracurricular memberships, and roles must be cleanly compartmentalized across school years without destroying historical data upon promotion or graduation.
- **Decision:** `academic_years` table maintains one active year (`is_active = true`). All scoped tables (`student_enrollments`, `role_user`, `extracurricular_members`, `activity_sessions`, `cash_transactions`) include `academic_year_id`.
- **Consequences:** Historical attendances and cash books remain preserved and queryable by year.
