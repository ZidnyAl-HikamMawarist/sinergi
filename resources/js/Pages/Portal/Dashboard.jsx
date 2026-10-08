import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
    RefreshCw,
    WifiOff,
    CheckCircle2,
    Building2,
    Clock,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

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
                <div className="mb-5 p-3.5 rounded-xl bg-[#FFF4D6] border border-[#F4B942] text-[#9A6B00] flex items-center space-x-2.5 shadow-xs">
                    <WifiOff className="w-4 h-4 text-[#F4B942] shrink-0" />
                    <div className="text-xs font-bold">
                        Koneksi terputus. Akses internet diperlukan untuk memperbarui token QR dinamis.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Digital Student ID Card */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full bg-white rounded-xl p-6 shadow-xs border border-[#D9E2EA] text-center">
                        {/* Student Details */}
                        <div>
                            <div className="w-12 h-12 rounded-lg bg-[#123B5D] text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-2.5">
                                {student.name?.charAt(0) || 'S'}
                            </div>
                            <h2 className="text-base font-extrabold text-[#17202A] tracking-tight">
                                {student.name}
                            </h2>
                            <p className="text-xs font-bold text-[#1769AA] mt-0.5">
                                NISN: {student.nisn || '-'} &bull; {currentClass}
                            </p>
                        </div>

                        {/* QR Code Container */}
                        <div className="my-5 p-3 rounded-xl bg-[#F5F7FA] border border-[#D9E2EA] inline-block relative">
                            {isOnline && token ? (
                                <QRCodeSVG
                                    value={token}
                                    size={200}
                                    level="M"
                                    includeMargin={true}
                                    className="mx-auto bg-white p-1 rounded-md border border-[#D9E2EA]"
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-[#536170] text-xs">
                                    <WifiOff className="w-8 h-8 mb-2 text-[#536170]" />
                                    <span>QR Membutuhkan Internet</span>
                                </div>
                            )}

                            {/* Refresh Indicator Overlay */}
                            {isRefreshing && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                                    <RefreshCw className="w-7 h-7 text-[#1769AA] animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Countdown Timer (AC-D1) */}
                        <div className="flex items-center justify-center space-x-2 text-xs font-medium text-[#536170]">
                            <Clock className="w-4 h-4 text-[#1769AA]" />
                            <span>
                                QR berganti dalam:{' '}
                                <strong className={`font-mono font-bold ${timeLeft <= 10 ? 'text-[#E76F51]' : 'text-[#1769AA]'}`}>
                                    {timeLeft}s
                                </strong>
                            </span>
                            <button
                                type="button"
                                onClick={fetchFreshQr}
                                disabled={isRefreshing || !isOnline}
                                className="p-1 rounded-md hover:bg-[#E8F4FB] text-[#1769AA] transition-colors ml-0.5"
                                title="Perbarui QR sekarang"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <p className="mt-4 text-[11px] text-[#536170] leading-relaxed border-t border-[#D9E2EA] pt-3">
                            Anti-titip absen: Kode QR diperbarui berkala dengan tanda tangan kriptografis HMAC. Tangkapan layar (*screenshot*) tidak berlaku.
                        </p>
                    </div>
                </div>

                {/* Enrolled Eskuls & Recent Attendances */}
                <div className="lg:col-span-7 space-y-5 w-full">
                    {/* Ekstrakurikuler yang diikuti */}
                    <Card
                        title="Ekstrakurikuler Saya"
                        subtitle="Keanggotaan aktif Anda pada tahun ajaran ini"
                        accentColor="blue"
                        className="border-[#D9E2EA]"
                    >
                        {memberships.length === 0 ? (
                            <div className="text-center py-6 text-[#536170] text-xs">
                                Anda belum terdaftar di ekstrakurikuler manapun.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {memberships.map((m) => (
                                    <div
                                        key={m.id}
                                        className="p-3 rounded-lg bg-white hover:bg-[#F5F7FA] border border-[#D9E2EA] flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-md bg-[#E8F4FB] text-[#1769AA] flex items-center justify-center font-bold text-xs shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-[#17202A]">
                                                    {m.extracurricular?.name}
                                                </h3>
                                                <span className="text-[10px] text-[#536170] font-semibold uppercase">
                                                    Jabatan: {m.position}
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-[#2A9D6F]" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Histori Kehadiran Terbaru */}
                    <Card
                        title="Riwayat Presensi Terbaru"
                        subtitle="Catatan kehadiran Anda pada sesi kegiatan eskul"
                        accentColor="green"
                        className="border-[#D9E2EA]"
                    >
                        {recentAttendances.length === 0 ? (
                            <div className="text-center py-6 text-[#536170] text-xs">
                                Belum ada catatan riwayat kehadiran.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D9E2EA] -mx-5 -my-2">
                                {recentAttendances.map((att) => (
                                    <div key={att.id} className="px-5 py-2.5 flex items-center justify-between hover:bg-[#F5F7FA] transition-colors">
                                        <div>
                                            <div className="text-xs font-bold text-[#17202A]">
                                                {att.activity_session?.title || 'Sesi Kegiatan'}
                                            </div>
                                            <div className="text-[11px] text-[#536170] mt-0.5">
                                                {att.activity_session?.extracurricular?.name} &bull;{' '}
                                                {att.recorded_at ? new Date(att.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </div>
                                            {att.note && (
                                                <div className="text-[10px] text-[#536170] italic mt-0.5">
                                                    Catatan: {att.note}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge status={att.status}>{att.status}</Badge>
                                            <span className="text-[10px] font-mono font-semibold text-[#536170] uppercase">
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
