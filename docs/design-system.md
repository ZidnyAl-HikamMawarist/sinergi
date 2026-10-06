# 🎨 SINERGI — Design System & Visual Identity

> **SINERGI** · Sistem Integrasi Ekstrakurikuler dan Organisasi  
> Design System v1.0 — Bright & Energetic Theme

---

## 🧠 Analisis & Filosofi Desain

### Kenapa warna-warna ini?

SINERGI adalah aplikasi untuk **siswa SMA/SMK**, dipakai dalam konteks ekstrakurikuler yang penuh semangat dan energi. Berikut pertimbangan pemilihan palet:

| Faktor | Dampak ke Desain |
|---|---|
| **Pengguna = remaja 14–18 tahun** | Warna harus enerjik, tidak membosankan |
| **Konteks sekolah (formal tapi muda)** | Tetap terstruktur, tidak terlalu playful |
| **Fungsi utama: presensi + kas** | Butuh hierarki informasi yang jelas |
| **PWA mobile-first** | Kontras tinggi, tombol besar, mudah dibaca di bawah sinar matahari |
| **Kepercayaan dan akuntabilitas (buku kas)** | Sentuhan biru dan hijau memberi kesan terpercaya |
| **Anti-dark mode** | Light theme dominan, warna-warna vivid cerah |

---

## 🎨 Color Palette

### Primary — Biru Elektrik
Melambangkan **kepercayaan, teknologi, dan keteraturan**. Cocok untuk fungsi utama seperti navigasi, tombol CTA, dan header.

```
Primary 50:   #EFF6FF  → Background ringan, hover state
Primary 100:  #DBEAFE  → Badge, tag ringan
Primary 200:  #BFDBFE  → Border aktif
Primary 300:  #93C5FD  → Highlight
Primary 400:  #60A5FA  → Ikon sekunder
Primary 500:  #3B82F6  → UTAMA — tombol, link aktif
Primary 600:  #2563EB  → Hover tombol
Primary 700:  #1D4ED8  → Pressed state
Primary 800:  #1E40AF  → Teks link gelap
Primary 900:  #1E3A8A  → Dark accent
```

**CSS Variable:**
```css
--color-primary-50:  #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;
```

---

### Secondary — Ungu Violet
Melambangkan **kreativitas, inovasi, dan semangat OSIS**. Digunakan untuk aksen, badge role, dan elemen dekoratif.

```
Secondary 50:  #F5F3FF  → Background aksen
Secondary 100: #EDE9FE  → Badge ungu ringan
Secondary 200: #DDD6FE  → Border ungu
Secondary 400: #A78BFA  → Ikon dekoratif
Secondary 500: #8B5CF6  → UTAMA — badge, tag role
Secondary 600: #7C3AED  → Hover
Secondary 700: #6D28D9  → Pressed
```

**CSS Variable:**
```css
--color-secondary-50:  #F5F3FF;
--color-secondary-100: #EDE9FE;
--color-secondary-200: #DDD6FE;
--color-secondary-400: #A78BFA;
--color-secondary-500: #8B5CF6;
--color-secondary-600: #7C3AED;
--color-secondary-700: #6D28D9;
```

---

### Accent — Oranye Amber
Melambangkan **semangat, perhatian, dan keaktifan**. Dipakai untuk notifikasi, highlight data penting, dan elemen hero.

```
Accent 50:  #FFFBEB  → Background peringatan lembut
Accent 100: #FEF3C7  → Badge warning
Accent 200: #FDE68A  → Highlight row
Accent 400: #FBBF24  → Ikon aktif
Accent 500: #F59E0B  → UTAMA — badge eskul aktif, highlight
Accent 600: #D97706  → Hover
```

**CSS Variable:**
```css
--color-accent-50:  #FFFBEB;
--color-accent-100: #FEF3C7;
--color-accent-200: #FDE68A;
--color-accent-400: #FBBF24;
--color-accent-500: #F59E0B;
--color-accent-600: #D97706;
```

---

### Success — Hijau Emerald
Untuk status **hadir, transaksi valid, QR berhasil di-scan**.

```
Success 50:  #ECFDF5
Success 100: #D1FAE5
Success 400: #34D399
Success 500: #10B981  (Utama)
Success 600: #059669
Success 700: #047857
```

**CSS Variable:**
```css
--color-success-50:  #ECFDF5;
--color-success-100: #D1FAE5;
--color-success-400: #34D399;
--color-success-500: #10B981;
--color-success-600: #059669;
--color-success-700: #047857;
```

---

### Danger — Merah Rose
Untuk status **alpa, transaksi void, error, aksi destruktif**.

```
Danger 50:  #FFF1F2
Danger 100: #FFE4E6
Danger 400: #FB7185
Danger 500: #F43F5E  (Utama)
Danger 600: #E11D48
Danger 700: #BE123C
```

**CSS Variable:**
```css
--color-danger-50:  #FFF1F2;
--color-danger-100: #FFE4E6;
--color-danger-400: #FB7185;
--color-danger-500: #F43F5E;
--color-danger-600: #E11D48;
--color-danger-700: #BE123C;
```

---

### Warning — Kuning Amber
Untuk status **izin, sakit, peringatan non-kritis**.

```
Warning 50:  #FEFCE8
Warning 100: #FEF9C3
Warning 400: #FACC15
Warning 500: #EAB308  (Utama)
Warning 600: #CA8A04
```

**CSS Variable:**
```css
--color-warning-50:  #FEFCE8;
--color-warning-100: #FEF9C3;
--color-warning-400: #FACC15;
--color-warning-500: #EAB308;
--color-warning-600: #CA8A04;
```

---

### Neutrals — Abu-abu Hangat
Untuk teks, background, border, dan surface card.

```
Neutral 0:   #FFFFFF  → Background utama
Neutral 50:  #F8FAFC  → Background halaman
Neutral 100: #F1F5F9  → Surface card, sidebar
Neutral 200: #E2E8F0  → Border, divider
Neutral 300: #CBD5E1  → Placeholder, disabled border
Neutral 400: #94A3B8  → Teks disabled, ikon lemah
Neutral 500: #64748B  → Teks caption, label sekunder
Neutral 600: #475569  → Teks body sekunder
Neutral 700: #334155  → Teks body utama
Neutral 800: #1E293B  → Heading
Neutral 900: #0F172A  → Heading utama, teks bold
```

**CSS Variable:**
```css
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
```

---

## 🖋️ Typography

### Font Family
```css
--font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

> **Kenapa Plus Jakarta Sans?** Font ini dirancang untuk UI digital, punya karakter yang modern tapi tetap ramah dan tidak terlalu korporat — cocok untuk aplikasi sekolah dengan pengguna remaja.

### Type Scale
```css
--text-xs:   0.75rem;   /* 12px — caption, helper text */
--text-sm:   0.875rem;  /* 14px — label, tag, badge */
--text-base: 1rem;      /* 16px — body text utama */
--text-lg:   1.125rem;  /* 18px — body besar, subheading */
--text-xl:   1.25rem;   /* 20px — card title */
--text-2xl:  1.5rem;    /* 24px — section heading */
--text-3xl:  1.875rem;  /* 30px — page title */
--text-4xl:  2.25rem;   /* 36px — hero heading */
```

### Font Weight
```css
--font-normal:    400;  /* Body */
--font-medium:    500;  /* Label, nav */
--font-semibold:  600;  /* Card title, button */
--font-bold:      700;  /* Section heading */
--font-extrabold: 800;  /* Hero, logo */
```

---

## 📐 Spacing & Layout

### Spacing Scale
```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Border Radius
```css
--radius-sm:   0.375rem;  /* 6px — tag, badge kecil */
--radius-md:   0.5rem;    /* 8px — input, tombol kecil */
--radius-lg:   0.75rem;   /* 12px — card, modal */
--radius-xl:   1rem;      /* 16px — card besar */
--radius-2xl:  1.5rem;    /* 24px — modal besar, sheet */
--radius-full: 9999px;    /* Pill — badge role, avatar */
```

---

## 🧩 Component Tokens

### Card
```css
--card-bg:           var(--color-neutral-0);
--card-border:       var(--color-neutral-200);
--card-shadow:       0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(59,130,246,0.06);
--card-shadow-hover: 0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(59,130,246,0.10);
--card-radius:       var(--radius-xl);
```

### Sidebar / Navigation
```css
--nav-bg:          #FFFFFF;
--nav-border:      var(--color-neutral-200);
--nav-item-active: var(--color-primary-50);
--nav-item-color:  var(--color-primary-600);
--nav-icon-active: var(--color-primary-500);
```

### Button — Primary
```css
--btn-primary-bg:        var(--color-primary-500);
--btn-primary-bg-hover:  var(--color-primary-600);
--btn-primary-bg-active: var(--color-primary-700);
--btn-primary-text:      #FFFFFF;
--btn-primary-shadow:    0 2px 8px rgba(59,130,246,0.35);
--btn-primary-radius:    var(--radius-lg);
```

### Button — Danger
```css
--btn-danger-bg:       var(--color-danger-500);
--btn-danger-bg-hover: var(--color-danger-600);
--btn-danger-text:     #FFFFFF;
```

### Input Field
```css
--input-bg:           var(--color-neutral-0);
--input-border:       var(--color-neutral-300);
--input-border-focus: var(--color-primary-400);
--input-ring-focus:   rgba(59,130,246,0.20);
--input-placeholder:  var(--color-neutral-400);
--input-text:         var(--color-neutral-800);
--input-radius:       var(--radius-md);
```

---

## 🏷️ Status Badges

### Presensi Status
| Status | Background | Text | Border |
|---|---|---|---|
| **Hadir** | `#D1FAE5` (success-100) | `#047857` (success-700) | `#34D399` (success-400) |
| **Izin** | `#FEF9C3` (warning-100) | `#92400E` | `#FDE047` |
| **Sakit** | `#DBEAFE` (primary-100) | `#1D4ED8` (primary-700) | `#93C5FD` (primary-300) |
| **Alpa** | `#FFE4E6` (danger-100) | `#BE123C` (danger-700) | `#FB7185` (danger-400) |

### Transaksi Kas Status
| Status | Background | Text |
|---|---|---|
| **Valid (Masuk)** | `#D1FAE5` | `#047857` |
| **Valid (Keluar)** | `#FFE4E6` | `#BE123C` |
| **Void** | `#F1F5F9` | `#64748B` |

### Role Badges
| Role | Background | Text |
|---|---|---|
| **Admin** | `#EDE9FE` (secondary-100) | `#6D28D9` (secondary-700) |
| **Bendahara** | `#D1FAE5` (success-100) | `#047857` (success-700) |
| **Pengurus Eskul** | `#DBEAFE` (primary-100) | `#1D4ED8` (primary-700) |
| **Siswa** | `#F1F5F9` (neutral-100) | `#334155` (neutral-700) |

---

## Gradients & Visual Effects

### Hero Gradient (Login / Landing)
```css
/* Gradient biru-ungu cerah */
background: linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 50%, #FDF4FF 100%);
```

### Primary Button Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
```

### Card Accent Strip (Top border untuk card penting)
```css
border-top: 3px solid var(--color-primary-500);
```

### Scanner QR — Success State
```css
background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
border: 2px solid #10B981;
```

### Scanner QR — Error State
```css
background: linear-gradient(135deg, #FFF1F2, #FFE4E6);
border: 2px solid #F43F5E;
```

---

## 🗺️ Page-by-Page Color Application

### 1. Login Page
- **Background:** Gradient `#EFF6FF → #EDE9FE` (biru-ungu sangat lembut)
- **Card:** Putih murni + shadow lembut
- **Logo/Brand:** Primary-500 + Secondary-500 gradient
- **Tombol Login:** Primary-500 dengan shadow `rgba(59,130,246,0.35)`
- **Input:** Border neutral-300, focus ring primary-400

### 2. Dashboard / Home
- **Background:** Neutral-50 (`#F8FAFC`)
- **Stat Cards:** Putih dengan accent strip warna berbeda per kartu:
  - Total Siswa → Primary (biru)
  - Eskul Aktif → Secondary (ungu)
  - Hadir Hari Ini → Success (hijau)
  - Kas Saldo → Accent (amber)
- **Sidebar:** Putih, nav item aktif primary-50, ikon primary-500

### 3. QR Scanner (Pengurus Eskul)
- **Background saat aktif:** Neutral-900 hanya di viewfinder kamera
- **Frame scanner:** Border primary-400 animasi pulse
- **Status sukses:** Success-50 + teks success-700 + border success-400
- **Status gagal:** Danger-50 + teks danger-700 + border danger-400
- **Header bar:** Primary-500

### 4. ID Digital Siswa (QR Code)
- **Background:** Gradient `#EFF6FF → #DBEAFE`
- **Card QR:** Putih, shadow tebal, radius-2xl
- **Timer countdown:** Accent-500 dengan animasi
- **Avatar:** Primary-500 gradient circle

### 5. Buku Kas
- **Background:** Neutral-50
- **Header saldo:** Gradient primary-500 → secondary-500
- **Row masuk:** Background success-50 / hover success-100
- **Row keluar:** Background danger-50 / hover danger-100
- **Row void:** Background neutral-100, opacity 60%, teks neutral-400 + strikethrough
- **Tombol Tambah:** Primary-500
- **Tombol Void:** Danger-500

### 6. Rekap Presensi
- **Tabel:** Zebra stripe neutral-50/putih
- **Header tabel:** Neutral-100
- **Status cell:** Badge kecil sesuai warna status
- **Tombol Ekspor:** Success-500

### 7. Admin Panel
- **Background:** Neutral-50
- **Halaman import:** Step indicator primary-500
- **Row error:** Background danger-50

---

## Shadow System

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.03);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04);

/* Colored shadows untuk tombol */
--shadow-primary: 0 4px 14px rgba(59, 130, 246, 0.35);
--shadow-success: 0 4px 14px rgba(16, 185, 129, 0.30);
--shadow-danger:  0 4px 14px rgba(244, 63, 94, 0.30);
```

---

## Animation & Motion

### Prinsip
- **Durasi:** 150ms (micro), 250ms (standard), 350ms (page transition)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Mobile:** Gunakan `transform` dan `opacity` saja (GPU-accelerated)

### Micro-interactions Penting
```css
/* Hover tombol */
.btn {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}
.btn:active { transform: translateY(0); }

/* Card hover */
.card {
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

/* QR refresh countdown */
@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Scan success flash */
@keyframes scan-success {
  0% { background: white; }
  30% { background: #D1FAE5; }
  100% { background: white; }
}

/* Scan error shake */
@keyframes scan-error {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
```

---

## Responsive Breakpoints

```css
--breakpoint-sm:  640px;   /* Mobile landscape */
--breakpoint-md:  768px;   /* Tablet */
--breakpoint-lg:  1024px;  /* Desktop kecil */
--breakpoint-xl:  1280px;  /* Desktop */
--breakpoint-2xl: 1536px;  /* Large desktop */
```

**Mobile-first approach** — desain untuk layar 375px terlebih dahulu, kemudian di-enhance untuk tablet/desktop.

---

## Accessibility (WCAG 2.1 AA)

| Pasangan Warna | Contrast Ratio | Status |
|---|---|---|
| Primary-700 `#1D4ED8` di atas putih | 5.9:1 | ✅ AA Pass |
| Primary-700 di atas Primary-50 | 5.2:1 | ✅ AA Pass |
| Neutral-700 `#334155` di atas putih | 9.8:1 | ✅ AAA Pass |
| Success-700 `#047857` di atas Success-50 | 6.4:1 | ✅ AA Pass |
| Danger-700 `#BE123C` di atas Danger-50 | 6.7:1 | ✅ AA Pass |
| Putih di atas Primary-600 `#2563EB` | 4.6:1 | ✅ AA Pass |

> **Catatan:** Gunakan Primary-600 atau Primary-700 sebagai background tombol, bukan Primary-500, untuk memenuhi WCAG AA pada teks normal.

---

## Tailwind CSS Config Reference

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
        secondary: {
          50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE',
          400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9',
        },
        accent: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          400: '#FBBF24', 500: '#F59E0B', 600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'primary':   '0 4px 14px rgba(59, 130, 246, 0.35)',
        'success':   '0 4px 14px rgba(16, 185, 129, 0.30)',
        'danger':    '0 4px 14px rgba(244, 63, 94, 0.30)',
        'card':      '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(59,130,246,0.06)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(59,130,246,0.10)',
      },
    },
  },
}
```

---

## Brand & Logo

- **Logomark:** Lingkaran dengan ikon QR + buku dalam gradient biru-ungu
- **Wordmark:** `SINERGI` — Plus Jakarta Sans ExtraBold, gradient `#3B82F6 → #8B5CF6`
- **Tagline:** *"Satu Platform, Semua Kegiatan"*
- **Favicon:** Background primary-500, ikon putih
- **PWA Icons:** PNG 192x192 + 512x512

---

## Quick Reference — Do's and Don'ts

### Do
- Gunakan `#F8FAFC` (neutral-50) untuk background halaman, bukan putih murni
- Gunakan **Primary-600 atau Primary-700** untuk teks tombol agar memenuhi contrast WCAG
- Tambahkan `border-radius` ke semua card dan tombol (`--radius-lg` minimal)
- Gunakan **colored shadow** (`--shadow-primary`) untuk tombol CTA utama
- Selalu beri **feedback visual animasi** saat scan QR (sukses/gagal)
- Import font **Plus Jakarta Sans** dari Google Fonts

### Don't
- Jangan gunakan background hitam/gelap gelap untuk halaman utama
- Jangan mix lebih dari **3 warna berbeda** dalam satu section
- Jangan gunakan Primary-500 sebagai warna teks di atas background putih (contrast rendah)
- Jangan buat tombol tanpa hover dan active state
- Jangan pakai font serif atau Times New Roman

---

*Design System SINERGI v1.0 — Fase 1 MVP*
