# 🏛️ SINERGI — Design System & Visual Identity
> **SINERGI** · Sistem Integrasi Ekstrakurikuler dan Organisasi  
> Design System v2.0 — Institutional, Restrained & Modern School Administration

---

## 📌 Executive Summary & Brand Philosophy

SINERGI is an institutional-grade school administration platform designed for high schools and vocational schools (SMA/SMK). It serves administrators, teachers, extracurricular officers, treasurers, and students.

### Core Principles
1. **Institutional & Professional:** Prioritizes clarity, credibility, and functional calm over decorative trends.
2. **Restrained Brand Color:** Built around a single, authoritative deep blue (`#1F4E79`) used purposefully for primary actions and active states—never overwhelming the screen.
3. **Information Over Decoration:** Content scanning, tabular legibility, clear hierarchy, and trustworthy transaction records take precedence over visual fluff.
4. **Anti "AI-Slop":** Eliminates oversized rounded pill containers, glowing cards, floating multi-layer drop shadows, and neon highlights.

### Strict Negative Constraints
- **NO GRADIENTS:** Zero gradients anywhere in the entire system. No `linear-gradient`, `radial-gradient`, or gradient background/text/border utilities. Every surface and interactive element uses solid, predictable fills.
- **PURPLE/VIOLET IS NOT PART OF THE SINERGI BRAND PALETTE:** Violet, purple, and indigo are completely excluded from the brand identity, navigation, badges, and accents.

---

## 🎨 Color System Tokens

All tokens are defined in `resources/css/app.css` and applied via unified Tailwind CSS classes and explicit design constants.

### 1. Brand Blue (Restrained Primary)
Blue communicates authority, reliability, and primary actions. It must **not** dominate whole screens or replace semantic signals.

| Token | Hex Value | Usage |
|---|---|---|
| **Primary** | `#1F4E79` | Primary action buttons, active navigation indicator, brand mark |
| **Primary Hover / Pressed** | `#173A5C` | Hover and active pressed states for primary actions |
| **Primary Soft** | `#EAF2F8` | Active navigation background, subtle selected row highlight |

### 2. Typography & Contrast (Ink & Neutrals)

| Token | Hex Value | Usage |
|---|---|---|
| **Ink** | `#17212B` | Headings, primary titles, emphasized values, dark table headers |
| **Body** | `#46515C` | Standard paragraphs, table content, form labels |
| **Muted** | `#737D86` | Secondary metadata, timestamps, input placeholders, helper text |

### 3. Surfaces & Structural Borders

| Token | Hex Value | Usage |
|---|---|---|
| **Page Background** | `#F7F5F0` | Warm institutional neutral background providing calm contrast |
| **Surface** | `#FFFFFF` | Card backgrounds, modals, input backgrounds, table sheets |
| **Header Surface** | `#FCFBF9` | Table `<thead>`, card header sections, drawer headers |
| **Border** | `#D9DEE3` | Crisp, low-contrast structural boundaries separating UI zones |

### 4. Semantic Status Colors
Status colors are reserved exclusively for semantic communication and must never be swapped for brand blue.

| Category | Solid Base | Soft Tint Surface | Usage |
|---|---|---|---|
| **Success** | `#287D5A` | `#EBF5F0` | Present attendance, active session, income transaction, verified status |
| **Warning** | `#B7791F` | `#FEF8EC` | Pending validation, overdue payment, caution alerts, audit flags |
| **Danger** | `#C24141` | `#FDF2F2` | Expense cash-out, absent attendance, voided transactions, destructive actions |

---

## 📐 Border Radius & Shadows

### Border Radius Rules
- **Buttons & Inputs:** `rounded-md` (`6px`) or `rounded-lg` (`8px`) for compact, predictable ergonomics.
- **Panels & Cards:** `rounded-lg` (`8px`) or `rounded-xl` (`12px`) with solid `#D9DEE3` border.
- **Badges:** `rounded` (`4px`) or restrained `rounded-md` (`6px`) for tabular data; pills are used only when semantically differentiating tags.
- **Prohibited:** Giant `rounded-3xl` cards or pill-shaped content sections.

### Shadow Reduction
- **Surface Separation:** Achieved through surface color contrast (`#F7F5F0` vs `#FFFFFF`) and crisp `#D9DEE3` 1px borders rather than heavy drop shadows.
- **Elevation:** Reserved strictly for overlay layers (Modals: `shadow-md`, Dropdown menus: `shadow-sm`).
- **Prohibited:** Neon glow shadows, multi-tier colorful shadows, or floating cards.

---

## 🔤 Typography & Hierarchy

Font Family: **Plus Jakarta Sans**, system fallback sans-serif.

| Level | Size | Weight | Line Height | Color |
|---|---|---|---|---|
| **Page Title (H1)** | `24px` (`text-2xl`) | Bold (`font-bold`) | `1.25` | `#17212B` |
| **Section Title (H2)** | `18px` (`text-lg`) | Semibold (`font-semibold`) | `1.3` | `#17212B` |
| **Subhead / Card Title (H3)** | `15px` (`text-base`) | Semibold (`font-semibold`) | `1.4` | `#17212B` |
| **Body Standard** | `14px` (`text-sm`) | Normal (`font-normal`) | `1.5` | `#46515C` |
| **Body Strong / Label** | `14px` (`text-sm`) | Medium / Semibold | `1.5` | `#17212B` |
| **Metadata / Helper Text** | `12px` (`text-xs`) | Normal (`font-normal`) | `1.4` | `#737D86` |
| **Table Headings** | `11px` (`text-xs`) | Semibold / Uppercase | `1.2` | `#737D86` |

---

## 🧩 Shared Component Guidelines

### 1. Buttons (`Button.jsx`)
- **Primary:** Background `#1F4E79`, text `#FFFFFF`. Hover: `#173A5C`. Active: scale-100 (no bouncy transforms).
- **Secondary / Neutral:** Background `#FFFFFF`, text `#17212B`, border `#D9DEE3`. Hover: `#F7F5F0`.
- **Danger:** Background `#C24141`, text `#FFFFFF`. Hover: `#A93232`.
- **Outline:** Transparent background, text `#1F4E79`, border `#1F4E79`. Hover: `#EAF2F8`.

### 2. Badges (`Badge.jsx`)
- **Success:** Background `#EBF5F0`, text `#287D5A`, border `#D1E7DD`.
- **Warning:** Background `#FEF8EC`, text `#B7791F`, border `#FCE8B2`.
- **Danger:** Background `#FDF2F2`, text `#C24141`, border `#F8D7DA`.
- **Primary / Active:** Background `#EAF2F8`, text `#1F4E79`, border `#D2E3F0`.
- **Neutral:** Background `#F7F5F0`, text `#46515C`, border `#D9DEE3`.

### 3. Cards & Panels (`Card.jsx`)
- White surface (`#FFFFFF`) with 1px border (`#D9DEE3`) and restrained radius (`rounded-lg`).
- Optional header has surface background `#FCFBF9` and subtle separator line.
- Avoid wrapping every statistic in independent floating cards; group data logically.

### 4. Tables
- Table wrapper: Solid `#D9DEE3` outer border, `rounded-lg`, overflow hidden.
- Header (`<thead>`): Background `#FCFBF9`, border-b `#D9DEE3`, text `#737D86` tracking-wider uppercase.
- Rows (`<tbody>`): Zebra striping avoided; divider `divide-y divide-[#D9DEE3]`. Row hover: `#F7F5F0`.
- Padding: Compact density (`py-3 px-4`) to maximize information display on admin viewports.

### 5. Form Controls (`Input.jsx`, `Select.jsx`)
- Border: `#D9DEE3`, focus ring: `#1F4E79`.
- Error state: Border `#C24141`, helper text `#C24141`, focus ring `#C24141`.
- Clean semantic labels with clear required indicators.

### 6. Modals & Dialogs (`Modal.jsx`)
- Centered dialog with backdrop `bg-[#17212B]/50`.
- Panel surface `#FFFFFF`, 1px border `#D9DEE3`, restrained header with clear title and close trigger.
- Explicit destructive confirmation buttons use semantic danger (`#C24141`).

---

## 📱 Responsive & Mobile Behavior

- **375px & 390px (Mobile):** Single column layouts, compact button bars, sticky headers, touch-friendly 44px minimum tap targets.
- **768px (Tablet):** Collapsible sidebar drawer, 2-column KPI grids, responsive horizontal scroll containers for dense data tables.
- **1024px+ (Desktop):** Fixed left navigation rail, expanded table views, side-by-side data ledgers.
- **QR Scanner & Attendance:** Viewport has dedicated `#17212B` dark framing for contrast against camera feed; action triggers and status banners remain prominent regardless of screen orientation.

---

## ♿ Accessibility (WCAG 2.1 AA)

1. **Text Contrast Ratios:**
   - Ink text (`#17212B`) on white (`#FFFFFF`) / warm page (`#F7F5F0`): **12.4:1** (Exceeds AAA).
   - Body text (`#46515C`) on white (`#FFFFFF`): **7.1:1** (Exceeds AAA).
   - Primary Blue button (`#1F4E79`) with white text: **7.9:1** (Exceeds AAA).
   - Semantic Danger (`#C24141`) on white: **5.1:1** (Exceeds AA).
   - Semantic Success (`#287D5A`) on white: **4.8:1** (Exceeds AA).
2. **Keyboard Navigation & Focus Indicators:**
   - Clear 2px focus ring (`focus:ring-[#1F4E79]`) on interactive elements.
3. **Form Accessibility:**
   - All inputs have explicit `<label>` bindings and `aria-describedby` error associations.
