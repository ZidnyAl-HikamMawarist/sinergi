import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QrCode, BookOpen, ShieldCheck, Sparkles, ArrowRight, Activity, Users } from 'lucide-react';

export default function Welcome({ appName = 'SINERGI', version = '1.0 MVP' }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
            <Head title="Selamat Datang" />

            {/* Top Navigation */}
            <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                            SINERGI
                        </span>
                        <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            v{version}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/25 transition-all duration-150 hover:-translate-y-0.5"
                    >
                        Masuk Sistem
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center items-center text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Platform Resmi Presensi Eskul & Buku Kas OSIS
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
                    Satu Platform Terintegrasi untuk <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Semua Kegiatan Sekolah</span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl">
                    Sistem validasi presensi ekstrakurikuler berbasis QR Dinamis anti-titip absen serta pencatatan kas organisasi yang transparan, akuntabel, dan immutable.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-150 hover:-translate-y-0.5"
                    >
                        Buka Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>

                {/* Feature Highlights Grid */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full text-left">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Presensi QR Dinamis</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Token QR berganti tiap 60 detik dengan tanda tangan kriptografis HMAC. Validasi cepat dan anti-replay.
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Buku Kas Akuntabel</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Setiap transaksi wajib disertai bukti valid. Tidak ada manipulasi diam-diam berkat sistem immutable & void.
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Multi-Role Workspace</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Satu akun siswa dapat bertindak sebagai pengurus eskul atau bendahara OSIS dengan workspace terisolasi.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-slate-200/60 bg-white/50 backdrop-blur-xs py-4 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} SINERGI — Sistem Integrasi Ekstrakurikuler dan Organisasi</p>
            </footer>
        </div>
    );
}
