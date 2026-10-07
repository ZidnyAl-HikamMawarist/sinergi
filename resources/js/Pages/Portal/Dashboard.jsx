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
                <div className="mb-5 p-3.5 rounded-lg bg-[#FEF8EC] border border-[#B7791F]/30 text-[#B7791F] flex items-center space-x-2.5 shadow-xs">
                    <WifiOff className="w-4 h-4 text-[#B7791F] shrink-0" />
                    <div className="text-xs font-semibold">
                        Koneksi terputus. Akses internet diperlukan untuk memperbarui token QR dinamis.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Digital Student ID Card */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full bg-white rounded-lg p-6 shadow-xs border border-[#D9DEE3] text-center">
                        {/* Student Details */}
                        <div>
                            <div className="w-12 h-12 rounded-md bg-[#1F4E79] text-white font-bold text-lg flex items-center justify-center mx-auto mb-2.5">
                                {student.name?.charAt(0) || 'S'}
                            </div>
                            <h2 className="text-base font-bold text-[#17212B] tracking-tight">
                                {student.name}
                            </h2>
                            <p className="text-xs font-semibold text-[#1F4E79] mt-0.5">
                                NISN: {student.nisn || '-'} &bull; {currentClass}
                            </p>
                        </div>

                        {/* QR Code Container */}
                        <div className="my-5 p-3 rounded-lg bg-[#F7F5F0] border border-[#D9DEE3] inline-block relative">
                            {isOnline && token ? (
                                <QRCodeSVG
                                    value={token}
                                    size={200}
                                    level="M"
                                    includeMargin={true}
                                    className="mx-auto bg-white p-1 rounded-sm"
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-[#737D86] text-xs">
                                    <WifiOff className="w-8 h-8 mb-2 text-[#737D86]" />
                                    <span>QR Membutuhkan Internet</span>
                                </div>
                            )}

                            {/* Refresh Indicator Overlay */}
                            {isRefreshing && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                    <RefreshCw className="w-7 h-7 text-[#1F4E79] animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Countdown Timer (AC-D1) */}
                        <div className="flex items-center justify-center space-x-2 text-xs font-medium text-[#46515C]">
                            <Clock className="w-4 h-4 text-[#1F4E79]" />
                            <span>
                                QR berganti dalam:{' '}
                                <strong className={`font-mono font-bold ${timeLeft <= 10 ? 'text-[#C24141]' : 'text-[#1F4E79]'}`}>
                                    {timeLeft}s
                                </strong>
                            </span>
                            <button
                                type="button"
                                onClick={fetchFreshQr}
                                disabled={isRefreshing || !isOnline}
                                className="p-1 rounded-md hover:bg-[#F7F5F0] text-[#1F4E79] transition-colors ml-0.5"
                                title="Perbarui QR sekarang"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <p className="mt-4 text-[11px] text-[#737D86] leading-relaxed border-t border-[#D9DEE3] pt-3">
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
                        accentColor="primary"
                    >
                        {memberships.length === 0 ? (
                            <div className="text-center py-6 text-[#737D86] text-xs">
                                Anda belum terdaftar di ekstrakurikuler manapun.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {memberships.map((m) => (
                                    <div
                                        key={m.id}
                                        className="p-3 rounded-md bg-[#FCFBF9] border border-[#D9DEE3] flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-md bg-[#EAF2F8] text-[#1F4E79] flex items-center justify-center font-bold text-xs shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-[#17212B]">
                                                    {m.extracurricular?.name}
                                                </h3>
                                                <span className="text-[10px] text-[#737D86] font-medium uppercase">
                                                    Jabatan: {m.position}
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-[#287D5A]" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Histori Kehadiran Terbaru */}
                    <Card
                        title="Riwayat Presensi Terbaru"
                        subtitle="Catatan kehadiran Anda pada sesi kegiatan eskul"
                    >
                        {recentAttendances.length === 0 ? (
                            <div className="text-center py-6 text-[#737D86] text-xs">
                                Belum ada catatan riwayat kehadiran.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D9DEE3] -mx-5 -my-2">
                                {recentAttendances.map((att) => (
                                    <div key={att.id} className="px-5 py-2.5 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-semibold text-[#17212B]">
                                                {att.activity_session?.title || 'Sesi Kegiatan'}
                                            </div>
                                            <div className="text-[11px] text-[#737D86] mt-0.5">
                                                {att.activity_session?.extracurricular?.name} &bull;{' '}
                                                {att.recorded_at ? new Date(att.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </div>
                                            {att.note && (
                                                <div className="text-[10px] text-[#737D86] italic mt-0.5">
                                                    Catatan: {att.note}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge status={att.status}>{att.status}</Badge>
                                            <span className="text-[10px] font-mono text-[#737D86] uppercase">
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
