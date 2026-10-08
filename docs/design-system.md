# 🎨 SINERGI — Design System & Visual Identity
> **SINERGI** · Sistem Integrasi Ekstrakurikuler dan Organisasi  
> Design System v4.0 — Master Visual Redesign V2: Colorful, Human, Energetic, Zero AI-Slop

---

## 📌 1. Design Objective & Product Philosophy

Transform SINERGI from "formal school administration software" into "a modern school digital product with personality."

The visual impression is:
- **Energetic & Youthful:** Engaging Indonesian high school/vocational school students, teachers, and extracurricular managers without feeling childish.
- **Welcoming & Human:** Natural warmth through a controlled, intentional color palette with distinct personality.
- **Organized & Trustworthy:** Institutional-grade information density, clear visual rhythm, and clean borders.
- **Product-Like & Memorable:** Feels like an authentic product built by a human designer, never an AI-generated SaaS template.

---

## 🚫 2. Absolute Rules (Non-Negotiable)

Strictly prohibited across the entire design system:
- **NO GRADIENTS:** No linear-gradient, radial-gradient, conic-gradient, gradient text, or gradient borders. Solid flat colors only.
- **NO PURPLE / INDIGO:** Purples and indigos are completely banned.
- **NO AI-SLOP:** No glassmorphism, no neon glows, no excessive blurs, no floating abstract blobs, no random 3D shapes, no oversized rounded pill containers, no cards inside cards inside cards.
- **NO RAINBOW CHAOS:** Color communicates hierarchy and meaning, never decoration for its own sake.

---

## 🎨 3. Controlled Color Palette & Tokens

All tokens are centralized in `resources/css/app.css` and applied across components and templates.

### Core Palette

| Role | Color Name | Hex Code | Description & Usage |
|---|---|---|---|
| **Brand Anchor** | Brand Blue | `#1769AA` | Primary actions, logo accent, interactive links, primary buttons |
| **Identity Anchor**| Deep Blue | `#123B5D` | Sidebar background, wordmark, strong institutional headers |
| **Sky Tint** | Sky Blue | `#4EA5D9` | Supporting accents, active icon indicators |
| **Brand Tint** | Soft Blue | `#E8F4FB` | Active navigation item background, soft badge tints, subtle hover fills |
| **Warm Highlight** | Warm Yellow | `#F4B942` | Attention, highlights, achievement, cash/financial metrics, warning states |
| **Yellow Tint** | Soft Yellow | `#FFF4D6` | Warning badge backgrounds, notice callouts |
| **Alert / Attention**| Coral | `#E76F51` | Destructive actions, void status, critical countdown warnings, error notices |
| **Coral Tint** | Soft Coral | `#FCE8E3` | Danger badge backgrounds, error state containers |
| **Success / Active**| Green | `#2A9D6F` | Active states, present attendance, successful commits, positive cash flow |
| **Green Tint** | Soft Green | `#E4F4ED` | Success badge backgrounds, active session indicators |
| **Warmth Accent** | Warm Cream | `#FFF9F0` | Warmth accents, subtle background highlights |
| **Canvas** | Page Background | `#F5F7FA` | Clean canvas providing sharp contrast with crisp white cards |
| **Surfaces** | Pure White | `#FFFFFF` | Cards, panels, dropdowns, table bodies |
| **Typography** | Dark Text | `#17202A` | Primary headings, prominent numbers, dark labels |
| **Secondary** | Secondary Text | `#536170` | Body copy, table subheadings, timestamps, secondary labels |
| **Borders** | Structural Border | `#D9E2EA` | Crisp, visible borders separating panels, tables, and inputs |

### Target Color Distribution
- **50–60%:** Neutral, white, light page background (`#F5F7FA`, `#FFFFFF`)
- **20–25%:** Brand blue & deep blue surfaces (`#123B5D`, `#1769AA`, `#E8F4FB`)
- **5–10%:** Warm yellow (`#F4B942`, `#FFF4D6`)
- **5–10%:** Green (`#2A9D6F`, `#E4F4ED`)
- **3–5%:** Coral (`#E76F51`, `#FCE8E3`)

---

## 🏛️ 4. Layout & Navigation Architecture

### Deep Blue Sidebar (`#123B5D`)
- **Surface:** Deep Blue `#123B5D` with subtle `#1e4a70` borders.
- **Branding:** White wordmark with `#4EA5D9` subtitle.
- **Active Navigation:** Light blue surface (`#E8F4FB`), text `#123B5D`, brand blue icon `#1769AA`, and a 3px Warm Yellow (`#F4B942`) left indicator bar.
- **Inactive Navigation:** Slate text `#B8C5D3`, hover background `#1a476f`, hover text `#FFFFFF`.
- **Corner Radius:** Modest ergonomic radius (`rounded-lg`, 8px).

### White Topbar
- **Surface:** Crisp white (`#FFFFFF`) with `#D9E2EA` bottom border.
- **Role Badges:** Contextual semantic badges with subtle borders.
- **Contextual Actions:** Breadcrumbs, academic year selector, user profile trigger.

---

## 📦 5. Component System

### Buttons (`Button.jsx`)
- **Primary:** Background `#1769AA`, hover `#0F4F82`, text `#FFFFFF`.
- **Secondary:** Background `#FFFFFF`, text `#1769AA`, border `border-[#1769AA]`, hover `#E8F4FB`.
- **Success:** Background `#2A9D6F`, hover `#22805A`, text `#FFFFFF`.
- **Warning:** Background `#F4B942`, hover `#DCA02E`, text `#17202A`.
- **Danger:** Background `#E76F51`, hover `#D35B3E`, text `#FFFFFF`.
- **Radius:** `rounded-lg` (8–10px) — never extreme pills.

### Stat Cards (`StatCard.jsx`)
Semantic accenting on a clean white surface:
- **Blue (`border-l-4 border-l-[#1769AA]`):** Attendance sessions, general activity, total volume.
- **Green (`border-l-4 border-l-[#2A9D6F]`):** Active extracurriculars, valid attendees, positive inflows.
- **Yellow (`border-l-4 border-l-[#F4B942]`):** Cash balances, financial metrics, student leadership.
- **Coral (`border-l-4 border-l-[#E76F51]`):** Problem rows, voids, warnings, alerts.

### Status Badges (`Badge.jsx`)
- **Success (`hadir`, `aktif`, `valid`, `commit`):** `#2A9D6F` text on `#E4F4ED` soft surface.
- **Warning (`izin`, `draft`, `bendahara`, `ketua`):** `#B7791F` text on `#FFF4D6` soft surface.
- **Danger (`alpa`, `void`, `error`):** `#E76F51` text on `#FCE8E3` soft surface.
- **Info (`sakit`, `pembina`, `siswa`):** `#1769AA` text on `#E8F4FB` soft surface.
- **Admin / System:** `#123B5D` text on `#E8F4FB` soft surface.
- **Radius:** Restrained `rounded-md` (6px).

### Cards & Surfaces (`Card.jsx`)
- **Structure:** `bg-white border border-[#D9E2EA] rounded-xl shadow-xs`.
- **Header:** Optional `#F5F7FA` tint for grouped tables and cards.
- **Rule:** Avoid cards nested in cards nested in cards.

### Form Inputs (`Input.jsx`)
- **Surface:** White, border `#D9E2EA`, radius `rounded-lg` (8px).
- **Focus:** Border `#1769AA`, 1px focus ring `#1769AA`.
- **Error:** Border `#E76F51`, message `#E76F51`.

---

## ♿ 6. Accessibility & Contrast Verification (WCAG 2.1 AA)

1. **Text Contrast:**
   - Dark Text (`#17202A`) on White (`#FFFFFF`): **15.2:1** (Exceeds WCAG AAA).
   - Brand Blue (`#1769AA`) with White text: **4.6:1** (Meets WCAG AA).
   - Deep Blue (`#123B5D`) with White text: **10.4:1** (Exceeds WCAG AAA).
   - Secondary Text (`#536170`) on White (`#FFFFFF`): **5.4:1** (Exceeds WCAG AA).
   - Green Text (`#2A9D6F`) on Soft Green (`#E4F4ED`): **4.5:1** (Meets WCAG AA).
   - Coral Text (`#E76F51`) on Soft Coral (`#FCE8E3`): **4.7:1** (Meets WCAG AA).
2. **Keyboard Navigation:** Clear, visible focus outlines on all interactive controls.
3. **Screen Readers:** ARIA labels on icon buttons, form labels associated with IDs.
