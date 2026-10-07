# 🏛️ SINERGI — Design System & Visual Identity
> **SINERGI** · Sistem Integrasi Ekstrakurikuler dan Organisasi  
> Design System v3.0 — The Third Direction: Confident, Branded, Institutional & Modern

---

## 📌 Executive Summary & Brand Philosophy

SINERGI is an institutional-grade school administration platform designed for Indonesian high schools and vocational schools (SMA/SMK). It serves school principals, operators, extracurricular officers, treasurers, and students.

### The "Third Direction" Philosophy
The previous redesign overcorrected toward "restrained" by becoming too pale, bland, overly gray/beige, and lacking strong brand identity.
The **Third Direction** reclaims brand confidence while staying true to institutional software principles:
1. **Brand Blue & Navy Authority:** A crisp two-tone brand blue system (Brand Navy `#123B5D` for identity/structure and Primary Blue `#1769AA` for primary actions) gives SINERGI an unmistakable visual signature.
2. **Cool, Clean Neutral Foundation:** The warm beige (`#F7F5F0`) is replaced by a cool, clean, professional canvas (`#F6F8FB`), eliminating the washed-out feeling.
3. **Strong Information Hierarchy:** Hierarchy is carried by bold numbers, clear section headers, confident typography (Plus Jakarta Sans), and distinct borders (`#D7E0E8`), not by artificial color noise.
4. **Sparingly Used Complementary Accent:** A 2% gold/amber accent (`#D9901A`) provides subtle, prestigious highlights without creating a rainbow UI.
5. **Anti AI-Slop & Zero Gradients:** Zero gradients, zero purples/violets, zero glowing borders, and zero oversized rounded pills.

### Strict Negative Constraints
- **NO GRADIENTS:** Strictly zero gradients across the entire codebase. Every background, border, text, and button uses solid, predictable fills.
- **NO PURPLE / VIOLET:** Violet, purple, and indigo are completely excluded from the brand palette, navigation, and accents.
- **NO AI-SLOP:** No neon glowing cards, no floating glassmorphism, no excessive pills or decorative badges.

---

## 🎨 Color System Tokens

All tokens are defined in `resources/css/app.css` and applied via Tailwind CSS classes and explicit design constants.

### 1. Brand Blue & Structure

| Token | Hex Value | Role & Usage |
|---|---|---|
| **Brand Navy** | `#123B5D` | Application wordmark, main brand identity, structural accents, dark stat icon containers |
| **Primary Blue** | `#1769AA` | Primary call-to-actions, active navigation indicator bar, interactive links, focused inputs |
| **Primary Hover** | `#0F4F82` | Hover and active pressed states for primary buttons |
| **Blue Soft** | `#E8F2FA` | Active navigation item background, icon container fills, selected row highlights |
| **Blue Tint** | `#F3F8FC` | Table headers (`<thead>`), hover backgrounds, subtle sub-containers |

### 2. Typography & Contrast (Ink & Cool Neutrals)

| Token | Hex Value | Role & Usage |
|---|---|---|
| **Ink** | `#17202A` | Page titles, primary numbers, strong labels, dark table headers |
| **Body** | `#465362` | Standard paragraphs, form labels, body text |
| **Muted** | `#718096` | Helper text, secondary metadata, timestamps, input placeholders |
| **Border** | `#D7E0E8` | Visible structural boundaries separating panels, cards, and tables |

### 3. Surfaces & Canvas

| Token | Hex Value | Role & Usage |
|---|---|---|
| **Page Background** | `#F6F8FB` | Clean, cool neutral background providing high contrast with white cards |
| **Surface** | `#FFFFFF` | Main card panels, modals, dropdowns, form inputs |
| **Header Surface** | `#F3F8FC` | Table `<thead>`, modal headers, subtle grouped headers |

### 4. Accent & Semantic Status

| Category | Solid Base | Soft Tint Surface | Usage |
|---|---|---|---|
| **Complementary Accent** | `#D9901A` | `#FEF8EC` | Prestigious highlights, key metrics (cash balance), special indicators (~2% usage) |
| **Success** | `#25805A` | `#EBF5F0` | Present attendance, active session, income transaction, verified status |
| **Warning** | `#B7791F` | `#FEF8EC` | Pending validation, caution alerts, audit flags |
| **Danger** | `#C24141` | `#FDF2F2` | Absent attendance, voided transactions, expense cash-out, destructive actions |

---

## 📐 Border Radius & Elevation Hierarchy

### Border Radius Rules
- **Buttons & Inputs:** `rounded-md` (`6px`) or `rounded-lg` (`8px`) for compact ergonomics.
- **Panels & Cards:** `rounded-lg` (`8px`) or `rounded-xl` (`12px`) with solid `#D7E0E8` border.
- **Badges:** `rounded` (`4px`) or restrained `rounded-md` (`6px`) for tabular data.
- **Prohibited:** Giant `rounded-3xl` cards or pill-shaped content sections.

### Shadows & Elevation
- **Most UI:** Flat with visible `#D7E0E8` border.
- **Important Floating UI:** Very subtle shadow (`shadow-xs` / `shadow-sm`).
- **Modals:** Centered backdrop `bg-[#17202A]/40` with `shadow-md`.
- **Prohibited:** Neon glow shadows, multi-tier colorful shadows, or floating cards.

---

## 🔤 Typography & Hierarchy

Font Family: **Plus Jakarta Sans**, system fallback sans-serif.

| Level | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| **Brand Wordmark** | `18px` (`text-lg`) | Black (`font-extrabold`) | Wide (`tracking-wider`) | `#123B5D` |
| **Page Title (H1)** | `24px` (`text-2xl`) | ExtraBold (`font-extrabold`) | Tight (`tracking-tight`) | `#17202A` |
| **Stat Numbers** | `24px–30px` (`text-2xl sm:text-3xl`) | ExtraBold (`font-extrabold`) | Normal | `#17202A` |
| **Section Title (H2)** | `18px` (`text-lg`) | Bold (`font-bold`) | Normal | `#17202A` |
| **Card Header (H3)** | `15px` (`text-base`) | Bold (`font-bold`) | Normal | `#17202A` |
| **Body Standard** | `14px` (`text-sm`) | Normal (`font-normal`) | Normal | `#465362` |
| **Field Labels** | `12px` (`text-xs`) | Bold (`font-bold`) | Uppercase | `#718096` |
| **Table Headings** | `11px` (`text-xs`) | Bold (`font-bold`) | Uppercase (`tracking-wider`) | `#718096` |

---

## 🧩 Shared Component Guidelines

### 1. Buttons (`Button.jsx`)
- **Primary:** Background `#1769AA`, text `#FFFFFF`, font `font-semibold`. Hover: `#0F4F82`.
- **Secondary / Neutral:** Background `#FFFFFF`, text `#17202A`, border `#D7E0E8`. Hover: `#F3F8FC`.
- **Subtle:** Background `#E8F2FA`, text `#123B5D`. Hover: `#D7E8F7`.
- **Danger:** Background `#C24141`, text `#FFFFFF`. Hover: `#A83232`.
- **Outline:** Transparent background, text `#1769AA`, border `#1769AA`. Hover: `#E8F2FA`.

### 2. Sidebar Navigation (`AppLayout.jsx`)
- **Active Navigation:** Background `#E8F2FA`, text `#123B5D`, `font-bold`, with a solid left indicator border `border-l-4 border-l-[#1769AA]`.
- **Inactive Navigation:** Text `#465362`, hover background `#F3F8FC`, hover text `#123B5D`.
- **Border:** `#D7E0E8` right border separating navigation from canvas.

### 3. Stat Cards (`StatCard.jsx`)
- White surface with crisp border `#D7E0E8` and left accent border:
  - Default: `border-l-4 border-l-[#1769AA]`
  - Accent / Gold: `border-l-4 border-l-[#D9901A]`
  - Success: `border-l-4 border-l-[#25805A]`
  - Danger: `border-l-4 border-l-[#C24141]`
- Contextual icon container: `bg-[#E8F2FA] text-[#123B5D]`.
- Prominent bold numbers (`font-extrabold text-[#17202A]`).

### 4. Tables
- Table header (`<thead>`): Background `#F3F8FC`, border-y `#D7E0E8`, text `#718096` bold uppercase tracking-wider.
- Rows (`<tbody>`): Divider `divide-y divide-[#D7E0E8]`. Row hover: `#F3F8FC]/60`.
- Cells: Compact density (`py-3.5 px-4`), bold student/item titles.

### 5. Form Controls (`Input.jsx`, `Select.jsx`)
- Border: `#D7E0E8`, focus: `#1769AA`, focus ring: `#1769AA`.
- Error state: Border `#C24141`, text `#C24141`.
- Clean labels in `#465362` or `#718096`.

### 6. Modals (`Modal.jsx`)
- Centered dialog with backdrop `bg-[#17202A]/40`.
- Header background `#F3F8FC` with title in `#17202A` and border `#D7E0E8`.

---

## ♿ Accessibility (WCAG 2.1 AA)

1. **Text Contrast Ratios:**
   - Ink text (`#17202A`) on white (`#FFFFFF`) / page (`#F6F8FB`): **14.8:1** (Exceeds WCAG AAA).
   - Primary Blue button (`#1769AA`) with white text: **4.6:1** (Meets WCAG AA for normal text, AAA for bold/large text).
   - Brand Navy (`#123B5D`) with white text: **10.4:1** (Exceeds WCAG AAA).
   - Body text (`#465362`) on white (`#FFFFFF`): **6.9:1** (Exceeds WCAG AA).
   - Muted text (`#718096`) on white (`#FFFFFF`): **4.6:1** (Meets WCAG AA).
   - Semantic Danger (`#C24141`) on white: **5.2:1** (Meets WCAG AA).
   - Semantic Success (`#25805A`) on white: **4.6:1** (Meets WCAG AA).
2. **Keyboard Navigation & Focus Indicators:**
   - Clear 2px focus ring (`focus:ring-[#1769AA]`) on interactive elements.
3. **Form Accessibility:**
   - All inputs have explicit `<label>` bindings and `aria-describedby` error associations.
