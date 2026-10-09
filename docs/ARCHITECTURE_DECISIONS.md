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

## ADR 005: Attendance Check-in Architecture — Gatekeeper Model with Multi-Device Concurrency
- **Status:** Accepted
- **Context:** Deciding between *Model A (Gatekeeper/Officer scans Student QR)* vs *Model B (Students scan Single Session QR on Screen/Projector)*.
- **Decision:** Implement **Model A (Gatekeeper/Kiosk)**:
  1. Students present their personal dynamic ID QR on their smartphone portal.
  2. Officers (Ketua/Wakil/Seksi Presensi) scan the QR using the `/eskul/scanner` interface.
  3. Support multi-device concurrent scanning: multiple officers can scan concurrently for the same session without race conditions or duplicate entries (backed by database atomic locking & uniqueness constraints).
  4. Provide instant "Presensi Manual" modal directly in the scanner interface for students with depleted batteries or broken screens.
- **Consequences:**
  - Guarantees physical presence verification (eliminates fraud from forwarding session QR pictures via WhatsApp).
  - Works even when student mobile data/internet quota is depleted (only the officer's device requires active connection).
  - Zero queue bottleneck when scaling: 50–100+ members can be routed through multiple parallel officer checkpoints (Gate 1, Gate 2).

## ADR 006: Timezone & Temporal Consistency — Dual UTC Invariance & Asia/Jakarta Operational Scope
- **Status:** Accepted
- **Context:** SINERGI operates exclusively for Indonesian educational institutions, primarily in the Western Indonesia Time zone (WIB / `Asia/Jakarta`, UTC+7). System features (dynamic QR code generation, 60s countdown refresh, manual attendance grace periods, audit timestamps, and financial ledger dates) require absolute synchronization regardless of student or administrator device settings.
- **Decision:**
  1. **Application Timezone:** Set `config('app.timezone')` to `Asia/Jakarta` (WIB) as the canonical operational timezone for business logic, logging, and attendance windows.
  2. **Storage Invariance:** Dynamic QR cryptographic tokens encode Unix epoch integers (`time()`), ensuring mathematical invariance across midnight and timezone changes.
  3. **Display Formatting:** User-facing date/time formatting on frontend (`resources/js/Utils/date.js`) and backend response messages explicitly target `Asia/Jakarta` with WIB designation.
  4. **Midnight Rollover:** Tokens generated immediately before midnight (e.g. 23:59:50) remain valid across the 00:00:00 boundary because expiration is evaluated via integer seconds delta, not date strings.
- **Consequences:** Eliminates time-skew discrepancies between student mobile phones and school server scanner instances.


