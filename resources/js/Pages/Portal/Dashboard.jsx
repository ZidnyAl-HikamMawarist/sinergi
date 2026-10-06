import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
    QrCode,
    RefreshCw,
    ShieldCheck,
    WifiOff,
    CheckCircle2,
    Calendar,
    Building2,
    Clock,
    UserCheck,
    Sparkles
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function PortalDashboard({
    student = {},
    memberships = [],
    recentAttendances = [],
    initialQr = {},
}) {
    const [token, setToken] = useState(initialQr.token || '');
    const [timeLeft, setTimeLeft] = useState(initialQr.ttl || 60);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor online/offline state (AC-D7)
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Countdown and auto-refresh timer (AC-D1)
    useEffect(() => {
        if (!isOnline) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    fetchFreshQr();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOnline]);

    const fetchFreshQr = async () => {
        if (!isOnline) return;
        setIsRefreshing(true);
        try {
            const res = await axios.get('/portal/qr-token');
            if (res.data?.token) {
                setToken(res.data.token);
                setTimeLeft(res.data.ttl || 60);
            }
        } catch (err) {
            console.error('Failed to refresh QR token:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const currentClass = student.enrollments?.[0]?.school_class?.name || 'Siswa Aktif';

    return (
        <AppLayout
            title="ID Digital & Presensi Siswa"
            header="ID Digital Siswa"
            subtitle="Tunjukkan QR dinamis ini kepada Pengurus Eskul saat sesi kegiatan dibuka."
        >
            {/* Offline Alert (AC-D7) */}
            {!isOnline && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center space-x-3 shadow-xs">
                    <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="text-xs font-semibold">
                        Koneksi terputus. Butuh akses internet untuk menampilkan dan memperbarui QR dinamis.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Digital Student ID Card */}
                <div className="lg:col-span-6 flex flex-col items-center">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 border border-slate-200/80 text-center relative overflow-hidden">
                        {/* Top decorative gradient bar */}
                        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600"></div>

                        {/* Student Details */}
                        <div className="mt-2">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                                {student.name?.charAt(0) || 'S'}
                            </div>
                            <h3 className="mt-3 text-lg font-extrabold text-slate-900 tracking-tight">
                                {student.name}
                            </h3>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">
                                NISN: {student.nisn || '-'} &bull; {currentClass}
                            </p>
                        </div>

                        {/* QR Code Container */}
                        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block shadow-inner relative group">
                            {isOnline && token ? (
                                <QRCodeSVG
                                    value={token}
                                    size={220}
                                    level="M"
                                    includeMargin={true}
                                    className="mx-auto"
                                />
                            ) : (
                                <div className="w-[220px] h-[220px] flex flex-col items-center justify-center text-slate-400 text-xs">
                                    <WifiOff className="w-10 h-10 mb-2 text-slate-300" />
                                    <span>QR Membutuhkan Internet</span>
                                </div>
                            )}

                            {/* Refresh Indicator Overlay */}
                            {isRefreshing && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Countdown Timer (AC-D1) */}
                        <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-600">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>
                                QR berganti dalam:{' '}
                                <strong className={`font-mono ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-blue-700'}`}>
                                    {timeLeft}s
                                </strong>
                            </span>
                            <button
                                type="button"
                                onClick={fetchFreshQr}
                                disabled={isRefreshing || !isOnline}
                                className="p-1 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors ml-1"
                                title="Perbarui QR sekarang"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <p className="mt-4 text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                            Anti-titip absen: Kode QR diperbarui secara berkala dan dilindungi tanda tangan kriptografis. Tangkapan layar (screenshot) tidak akan valid.
                        </p>
                    </div>
                </div>

                {/* Enrolled Eskuls & Recent Attendances */}
                <div className="lg:col-span-6 space-y-6 w-full">
                    {/* Ekstrakurikuler yang diikuti */}
                    <Card
                        title="Ekstrakurikuler Saya"
                        subtitle="Keanggotaan aktif Anda pada periode berjalan"
                        accentColor="primary"
                    >
                        {memberships.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                Anda belum terdaftar di ekstrakurikuler manapun. Hubungi pengurus eskul Anda.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {memberships.map((m) => (
                                    <div
                                        key={m.id}
                                        className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">
                                                    {m.extracurricular?.name}
                                                </h4>
                                                <span className="text-[10px] text-blue-700 font-semibold uppercase">
                                                    Jabatan: {m.position}
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Histori Kehadiran Terbaru */}
                    <Card
                        title="Riwayat Presensi Terbaru"
                        subtitle="Catatan kehadiran Anda pada kegiatan eskul"
                        accentColor="secondary"
                    >
                        {recentAttendances.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                Belum ada catatan riwayat kehadiran.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentAttendances.map((att) => (
                                    <div key={att.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">
                                                {att.activity_session?.title || 'Sesi Kegiatan'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                {att.activity_session?.extracurricular?.name} &bull;{' '}
                                                {att.recorded_at ? new Date(att.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </div>
                                            {att.note && (
                                                <div className="text-[10px] text-slate-400 italic">
                                                    Catatan: {att.note}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge status={att.status}>{att.status}</Badge>
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                                                {att.method}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
