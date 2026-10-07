import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QrCode, BookOpen, ShieldCheck, ArrowRight, Building2, Users } from 'lucide-react';

export default function Welcome({ appName = 'SINERGI', version = '1.0' }) {
    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#17212B] flex flex-col justify-between selection:bg-[#1F4E79] selection:text-white">
            <Head title="Selamat Datang" />

            {/* Top Navigation */}
            <header className="w-full bg-white border-b border-[#D9DEE3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md bg-[#1F4E79] flex items-center justify-center text-white font-bold text-sm">
                            <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-[#17212B]">
                                SINERGI
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF2F8] text-[#1F4E79] border border-[#cee0f0]">
                                v{version}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F4E79] hover:bg-[#173A5C] rounded-md shadow-xs transition-colors"
                        >
                            Masuk Sistem
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF2F8] border border-[#cee0f0] text-[#1F4E79] text-xs font-semibold mb-6">
                    <ShieldCheck className="w-4 h-4 text-[#1F4E79]" />
                    Sistem Resmi Administrasi Presensi & Buku Kas Sekolah
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17212B] max-w-3xl leading-tight">
                    Platform Tata Kelola Ekstrakurikuler & Keuangan Organisasi
                </h1>

                <p className="mt-4 text-sm sm:text-base text-[#46515C] max-w-2xl leading-relaxed">
                    Presensi kegiatan berbasis QR Dinamis anti-titip absen dan pencatatan buku kas OSIS yang transparan, akuntabel, serta immutable.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#1F4E79] hover:bg-[#173A5C] active:bg-[#122941] rounded-md shadow-xs transition-colors"
                    >
                        Buka Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {/* Feature Highlights Grid */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left">
                    <div className="bg-white p-5 rounded-lg border border-[#D9DEE3] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#EAF2F8] text-[#1F4E79] flex items-center justify-center mb-3">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17212B]">Presensi QR Dinamis</h2>
                        <p className="mt-1.5 text-xs text-[#46515C] leading-relaxed">
                            Token QR berganti berkala dengan enkripsi HMAC. Menjamin kehadiran fisik siswa di lokasi kegiatan.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#D9DEE3] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#EBF5F0] text-[#287D5A] flex items-center justify-center mb-3">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17212B]">Buku Kas Akuntabel</h2>
                        <p className="mt-1.5 text-xs text-[#46515C] leading-relaxed">
                            Setiap transaksi kas wajib berbukti nota fisik dan tidak dapat diedit secara sepihak (sistem void & audit trail).
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#D9DEE3] shadow-xs">
                        <div className="w-9 h-9 rounded-md bg-[#EAF2F8] text-[#1F4E79] flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-bold text-[#17212B]">Multi-Role Workspace</h2>
                        <p className="mt-1.5 text-xs text-[#46515C] leading-relaxed">
                            Pemisahan hak akses yang tegas untuk Admin OSIS, Pengurus Eskul, Bendahara, dan Siswa sesuai tahun ajaran aktif.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#D9DEE3] bg-white py-3.5 text-center text-xs text-[#737D86]">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
