import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QrCode, BookOpen, ShieldCheck, ArrowRight, Building2, Users } from 'lucide-react';

export default function Welcome({ appName = 'SINERGI', version = '1.0' }) {
    return (
        <div className="min-h-screen bg-[#F6F8FB] text-[#17202A] flex flex-col justify-between selection:bg-[#1769AA] selection:text-white">
            <Head title="Selamat Datang" />

            {/* Top Navigation */}
            <header className="w-full bg-white border-b border-[#D7E0E8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md bg-[#123B5D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight text-[#123B5D]">
                                SINERGI
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2FA] text-[#123B5D] border border-[#1769AA]/20">
                                v{version}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#1769AA] hover:bg-[#0F4F82] rounded-md shadow-xs transition-colors"
                        >
                            Masuk Sistem
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#E8F2FA] border border-[#1769AA]/20 text-[#123B5D] text-xs font-bold mb-6">
                    <ShieldCheck className="w-4 h-4 text-[#1769AA]" />
                    Sistem Resmi Administrasi Presensi & Buku Kas Sekolah
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17202A] max-w-3xl leading-tight">
                    Platform Tata Kelola Ekstrakurikuler & Keuangan Organisasi
                </h1>

                <p className="mt-4 text-sm sm:text-base text-[#465362] max-w-2xl leading-relaxed">
                    Presensi kegiatan berbasis QR Dinamis anti-titip absen dan pencatatan buku kas OSIS yang transparan, akuntabel, serta immutable.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-[#1769AA] hover:bg-[#0F4F82] active:bg-[#123B5D] rounded-md shadow-xs transition-colors"
                    >
                        Buka Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {/* Feature Highlights Grid */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left">
                    <div className="bg-white p-5 rounded-lg border border-[#D7E0E8] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#E8F2FA] text-[#123B5D] flex items-center justify-center mb-3">
                            <QrCode className="w-5 h-5 text-[#1769AA]" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17202A]">Presensi QR Dinamis</h2>
                        <p className="mt-1.5 text-xs text-[#465362] leading-relaxed">
                            Token QR berganti berkala dengan enkripsi HMAC. Menjamin kehadiran fisik siswa di lokasi kegiatan.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#D7E0E8] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#EBF5F0] text-[#25805A] flex items-center justify-center mb-3">
                            <BookOpen className="w-5 h-5 text-[#25805A]" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17202A]">Buku Kas Akuntabel</h2>
                        <p className="mt-1.5 text-xs text-[#465362] leading-relaxed">
                            Setiap transaksi kas wajib berbukti nota fisik dan tidak dapat diedit secara sepihak (sistem void & audit trail).
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#D7E0E8] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#E8F2FA] text-[#123B5D] flex items-center justify-center mb-3">
                            <Users className="w-5 h-5 text-[#1769AA]" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17202A]">Multi-Role Workspace</h2>
                        <p className="mt-1.5 text-xs text-[#465362] leading-relaxed">
                            Pemisahan hak akses yang tegas untuk Admin OSIS, Pengurus Eskul, Bendahara, dan Siswa sesuai tahun ajaran aktif.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#D7E0E8] bg-white py-3.5 text-center text-xs text-[#718096]">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
