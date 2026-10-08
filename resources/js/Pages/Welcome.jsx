import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    QrCode,
    BookOpen,
    ShieldCheck,
    ArrowRight,
    Building2,
    Users,
    CheckCircle2,
    Sparkles,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

export default function Welcome({ appName = 'SINERGI', version = '1.0' }) {
    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#17202A] flex flex-col justify-between selection:bg-[#1769AA] selection:text-white">
            <Head title="Selamat Datang — SINERGI" />

            {/* Top Navigation */}
            <header className="w-full bg-white border-b border-[#D9E2EA] sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight text-[#123B5D]">
                                SINERGI
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#E8F4FB] text-[#1769AA] border border-[#1769AA]/25">
                                v{version}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#1769AA] hover:bg-[#0F4F82] rounded-lg shadow-xs transition-colors"
                        >
                            Masuk Portal
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1">
                {/* 2-Column Hero: Left Headline/CTA, Right Product Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Headline, Description, CTAs */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E8F4FB] border border-[#1769AA]/20 text-[#1769AA] text-xs font-bold shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-[#2A9D6F]"></span>
                            Platform Resmi Presensi & Buku Kas Sekolah
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17202A] leading-tight">
                            Kelola Organisasi & Ekstrakurikuler{' '}
                            <span className="text-[#1769AA]">Lebih Hidup</span> dan Akuntabel.
                        </h1>

                        <p className="text-sm sm:text-base text-[#536170] leading-relaxed max-w-2xl font-normal">
                            Sistem presensi berbasis <strong>QR Dinamis anti-titip absen</strong> dan pembukuan kas OSIS yang transparan, aman, serta terstruktur rapi untuk seluruh civitas sekolah.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-[#1769AA] hover:bg-[#0F4F82] active:bg-[#123B5D] rounded-lg shadow-xs transition-colors"
                            >
                                Buka Dashboard Sekolah
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-[#1769AA] bg-white hover:bg-[#E8F4FB] border border-[#1769AA] rounded-lg shadow-xs transition-colors"
                            >
                                Pelajari Fitur
                            </a>
                        </div>

                        {/* Quick Trust Badges */}
                        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#536170] font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#2A9D6F]" />
                                Enkripsi HMAC Dinamis
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#2A9D6F]" />
                                Buku Kas Immutable & Berbukti
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#2A9D6F]" />
                                Hak Akses Multi-Role
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Flat Product Preview Composition */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-xl border border-[#D9E2EA] shadow-card overflow-hidden">
                            {/* Window Top Bar */}
                            <div className="bg-[#123B5D] text-white px-4 py-3 flex items-center justify-between border-b border-[#0F2F4A]">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#E76F51]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#F4B942]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#2A9D6F]"></div>
                                    <span className="text-xs font-bold text-slate-200 ml-2">SINERGI Live Preview</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1769AA] text-white">
                                    Sesi Aktif
                                </span>
                            </div>

                            {/* Preview Body */}
                            <div className="p-4 sm:p-5 space-y-4 bg-[#F5F7FA]">
                                {/* 2 Mini KPI Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg border border-[#D9E2EA] border-l-4 border-l-[#1769AA] shadow-xs">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#536170] block">
                                            Kehadiran Hari Ini
                                        </span>
                                        <div className="text-lg font-extrabold text-[#17202A] mt-0.5">
                                            98.4%
                                        </div>
                                        <span className="text-[10px] text-[#2A9D6F] font-bold flex items-center gap-0.5 mt-0.5">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2A9D6F]"></span>
                                            48 Hadir Tepat Waktu
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-lg border border-[#D9E2EA] border-l-4 border-l-[#F4B942] shadow-xs">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#536170] block">
                                            Saldo Kas OSIS
                                        </span>
                                        <div className="text-lg font-extrabold text-[#17202A] mt-0.5">
                                            Rp 14.850.000
                                        </div>
                                        <span className="text-[10px] text-[#1769AA] font-bold flex items-center gap-0.5 mt-0.5">
                                            Terverifikasi Server
                                        </span>
                                    </div>
                                </div>

                                {/* Live Scan Item */}
                                <div className="bg-white p-3.5 rounded-lg border border-[#D9E2EA] shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-[#17202A] flex items-center gap-1.5">
                                            <QrCode className="w-4 h-4 text-[#1769AA]" />
                                            Presensi Berhasil
                                        </span>
                                        <span className="text-[10px] font-mono text-[#536170]">
                                            15:40 WIB
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-[#E4F4ED] border border-[#2A9D6F]/30 px-3 py-2 rounded-md">
                                        <div>
                                            <div className="text-xs font-bold text-[#17202A]">Ahmad Fauzi</div>
                                            <div className="text-[10px] text-[#536170]">NISN: 0078129381 &bull; Pramuka</div>
                                        </div>
                                        <span className="text-[11px] font-extrabold text-[#2A9D6F] uppercase">
                                            HADIR
                                        </span>
                                    </div>
                                </div>

                                {/* Security Indicator */}
                                <div className="flex items-center justify-between px-2 text-[11px] text-[#536170] font-medium">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#2A9D6F]" />
                                        HMAC Anti-Replay Token
                                    </span>
                                    <span className="text-[#1769AA] font-bold">Terlindungi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights Grid */}
                <div id="features" className="mt-16 sm:mt-20">
                    <div className="text-left mb-6">
                        <span className="text-xs font-bold text-[#1769AA] uppercase tracking-wider block">
                            Pilar Utama Sistem
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17202A] mt-1">
                            Dirancang Humanis Untuk Kebutuhan Sekolah
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                        {/* Feature Card 1: Blue Accent (QR Attendance) */}
                        <div className="bg-white p-6 rounded-xl border border-[#D9E2EA] border-t-4 border-t-[#1769AA] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F4FB] text-[#1769AA] flex items-center justify-center">
                                        <QrCode className="w-5 h-5 text-[#1769AA]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F4FB] text-[#1769AA]">
                                        Presensi
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-[#17202A]">Presensi QR Dinamis</h3>
                                <p className="mt-2 text-xs text-[#536170] leading-relaxed">
                                    Token QR diperbarui setiap 60 detik dengan HMAC signature. Menangkal tangkapan layar (screenshot) dan memastikan siswa benar-benar hadir di lokasi.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#D9E2EA] text-[11px] font-bold text-[#1769AA] flex items-center justify-between">
                                <span>Mode Scanner & Manual</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Feature Card 2: Green Accent (Cash Book) */}
                        <div className="bg-white p-6 rounded-xl border border-[#D9E2EA] border-t-4 border-t-[#2A9D6F] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#E4F4ED] text-[#2A9D6F] flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-[#2A9D6F]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E4F4ED] text-[#2A9D6F]">
                                        Keuangan
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-[#17202A]">Buku Kas Akuntabel</h3>
                                <p className="mt-2 text-xs text-[#536170] leading-relaxed">
                                    Setiap transaksi wajib disertai bukti fisik (nota/kuitansi). Transaksi bersifat immutable (anti-hapus sembunyi-sembunyi) dengan mekanisme void transparan.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#D9E2EA] text-[11px] font-bold text-[#2A9D6F] flex items-center justify-between">
                                <span>Audit Trail Otomatis</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Feature Card 3: Yellow Accent (Multi-Role) */}
                        <div className="bg-white p-6 rounded-xl border border-[#D9E2EA] border-t-4 border-t-[#F4B942] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#FFF4D6] text-[#B27B10] flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#B27B10]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF4D6] text-[#B27B10]">
                                        Organisasi
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-[#17202A]">Multi-Role Workspace</h3>
                                <p className="mt-2 text-xs text-[#536170] leading-relaxed">
                                    Ruang kerja terisolasi untuk Admin Sekolah, Pengurus Eskul, Bendahara OSIS, dan Siswa. Navigasi rapi sesuai peran tanpa tumpang tindih data.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#D9E2EA] text-[11px] font-bold text-[#B27B10] flex items-center justify-between">
                                <span>Tahun Ajaran Scoped</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#D9E2EA] bg-white py-4 text-center text-xs text-[#536170]">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
