# 📋 Panduan Operasional Presensi & Keanggotaan Ekstrakurikuler — SINERGI

Dokumen ini mencatat alur kerja, arsitektur operasional di lapangan, perbedaan fitur antarmuka, serta solusi untuk skenario massal pada sistem presensi ekstrakurikuler SINERGI.

---

## 1. 🔄 Alur Presensi di Lapangan: "Model Gatekeeper"

SINERGI menggunakan alur **Siswa Menunjukkan ID QR ➡️ Pengurus Eskul yang Memindai (Scan)**.

```
┌────────────────────────┐              ┌────────────────────────┐
│      PORTAL SISWA      │              │     PENGURUS ESKUL     │
│                        │              │                        │
│ 1. Siswa buka HP       │  Tunjukkan   │ 2. Buka menu Scanner   │
│ 2. Tampil ID Digital QR│ ───────────> │ 3. Arahkan kamera HP   │
│    (Dinamis 60 detik)  │   Layar HP   │    ke layar siswa      │
└────────────────────────┘              └───────────┬────────────┘
                                                    │
                                                    ▼
                                        ┌────────────────────────┐
                                        │     SERVER SINERGI     │
                                        │                        │
                                        │ • Validasi HMAC token  │
                                        │ • Cek keanggotaan aktif│
                                        │ • Catat status HADIR   │
                                        │ • Anti-double scan     │
                                        └────────────────────────┘
```

### Mengapa Memilih Model Ini?
1. **Verifikasi Fisik Mutlak (Anti-Titip Absen):** Pengurus dan siswa bertatap muka langsung di pintu masuk/lapangan. Siswa yang tidak hadir di sekolah tidak mungkin bisa menitipkan absensi.
2. **Hemat Kuota Siswa:** Cukup perangkat pengurus yang terhubung internet/WiFi sekolah. Siswa tetap bisa menampilkan QR ID-nya meskipun paket datanya habis.
3. **Anti-Replay Attack:** Kode QR pada layar siswa diperbarui secara otomatis setiap **60 detik** menggunakan enkripsi *HMAC-SHA256*. Tangkapan layar (*screenshot*) yang dikirim lewat WhatsApp akan cepat kedaluwarsa.

---

## 2. ⚡ Strategi Operasional untuk Anggota Banyak (50–100+ Siswa)

Jika satu eskul memiliki puluhan hingga ratusan anggota, gunakan 2 teknik lapangan berikut agar tidak terjadi antrean:

### A. Multi-Gate Scanning (Banyak HP Pengurus Sekaligus)
* Sistem SINERGI bersifat **Concurrent-Safe (Aman Diakses Bersamaan)**.
* **Ketua, Wakil, dan Seksi Absensi (2–3 orang)** dapat membuka menu **Scanner QR** di HP masing-masing pada waktu yang sama untuk sesi kegiatan yang sama.
* Buat 2 jalur antrean:
  * **Jalur A (Gate 1):** Di-scan oleh Ketua Eskul.
  * **Jalur B (Gate 2):** Di-scan oleh Seksi Presensi.
* *Kapasitas:* 80–100 anggota dapat selesai diabsen dalam waktu **kurang dari 2–3 menit**.

### B. "Model Kasir Minimarket" (Walk-Through)
* **Hindari:** Menjejerkan HP siswa di meja lalu menyapu kamera dengan cepat (karena ayunan tangan menyebabkan gambar blur dan layar HP siswa sering mati otomatis).
* **Praktik Terbaik:**
  1. Pengurus memegang HP scanner secara stabil setinggi dada atau meletakkannya di atas meja menghadap ke arah barisan siswa.
  2. Siswa berjalan santai melewati scanner sambil mendekatkan layar HP-nya selama **1 detik**.
  3. Sistem memproses dalam hitungan milidetik, mengeluarkan feedback hijau, mem-pause selama 1.5 detik (*cooldown anti-dobel*), lalu siap membaca siswa berikutnya.

---

## 3. 🚨 Penanganan Masalah di Lapangan (Edge Cases)

| Kendala Siswa | Solusi Operasional di SINERGI |
| :--- | :--- |
| **HP Siswa Mati / Baterai Habis** | Pengurus menekan tombol **"Presensi Manual"** (di pojok kanan atas menu Scanner QR), ketik nama/NISN siswa, lalu klik **Simpan Kehadiran**. |
| **Layar HP Siswa Retak / Gelap** | Siswa diminta menaikkan kecerahan layar (*brightness*) maksimal, atau gunakan tombol **Presensi Manual**. |
| **Siswa Kena Scan 2 Kali** | Sistem otomatis memblokir duplikasi dan menampilkan notifikasi: *"Siswa ini sudah tercatat hadir pada sesi ini"*. Data dijamin tidak ganda. |
| **Bukan Anggota Eskul** | Jika ada siswa luar yang iseng menunjukkan QR, scanner langsung menampilkan peringatan merah: *"Siswa bukan anggota aktif eskul ini"*. |

---

## 4. 🧭 Perbedaan Menu: "Anggota Eskul" vs "Rekap Kehadiran"

Agar pengurus dan pembina eskul tidak tertukar fungsi antarmuka:

| Parameter | 👥 **Anggota Eskul** (`/eskul/members`) | 📊 **Rekap Kehadiran** (`/eskul/rekap`) |
| :--- | :--- | :--- |
| **Tujuan** | **Manajemen Personalia & Struktur Roster** | **Analitik & Rekapitulasi Presensi** |
| **Informasi Utama** | • Struktur Jabatan (👑 Ketua, 🛡️ Wakil, 👤 Anggota)<br>• Kelas & NISN Siswa<br>• Tanggal Bergabung (*Joined At*) | • Total Sesi Latihan yang telah dibuka<br>• Rincian Hadir, Izin, Sakit, Alpa<br>• Persentase Kehadiran Siswa (%) |
| **Aksi Utama** | • **Tambah Anggota Baru** (mendaftarkan siswa aktif ke eskul)<br>• **Atur Struktur / Jabatan**<br>• **Keluarkan / Nonaktifkan Anggota** (*soft-exit* aman tanpa merusak riwayat masa lalu) | • Filter berdasarkan eskul & periode<br>• **Export Rekap ke CSV / Excel** untuk laporan nilai eskul ke Pembina & Wakasek Kesiswaan |

---

## 5. 🔒 Ringkasan Teknis Kriptografi QR

1. **Format Payload Token:**
   `base64url({ uuid: student_uuid, exp: timestamp_in_seconds, sig: hmac_sha256 })`
2. **Kunci Enkripsi:** Menggunakan `APP_KEY` server Laravel.
3. **Masa Berlaku (TTL):** 60 detik (+ toleransi pergeseran waktu jam perangkat ±15 detik).
4. **Anti-Replay Table:** Token yang sudah sukses di-scan langsung dicatat ke tabel `qr_token_uses` agar tidak dapat digunakan kembali meskipun masa berlakunya masih tersisa beberapa detik.
