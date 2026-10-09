import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import {
    ScanLine,
    CheckCircle2,
    AlertCircle,
    Users,
    Calendar,
    Camera,
    CameraOff,
    CheckSquare,
    RefreshCw,
    X
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';
import { formatIndonesianDate, formatIndonesianTime } from '@/Utils/format';

export default function Scanner({
    openSessions = [],
    selectedSession = null,
    attendances = [],
    members = [],
}) {
    const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null); // { success: bool, message: string, student: obj }
    const [manualModal, setManualModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const scannerRef = useRef(null);

    // Form for manual attendance override
    const {
        data: manualData,
        setData: setManualData,
        post: postManual,
        processing: manualProcessing,
        errors: manualErrors,
        reset: resetManual,
    } = useForm({
        session_uuid: selectedSession?.uuid || '',
        user_id: '',
        status: 'hadir',
        note: '',
    });

    useEffect(() => {
        if (selectedSession) {
            setManualData('session_uuid', selectedSession.uuid);
        }
    }, [selectedSession]);

    // Initialize HTML5 QR Scanner
    useEffect(() => {
        if (activeTab === 'camera' && selectedSession) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [activeTab, selectedSession]);

    const startScanner = async () => {
        try {
            const qrRegionId = 'qr-reader';
            const element = document.getElementById(qrRegionId);
            if (!element) return;

            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch (e) {}
            }

            const html5QrCode = new Html5Qrcode(qrRegionId);
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            await html5QrCode.start(
                { facingMode: 'environment' },
                config,
                handleQrScanned,
                (errorMessage) => {
                    // Ignore transient frame-by-frame errors
                }
            );

            setIsScanning(true);
        } catch (err) {
            console.error('Error starting camera scanner:', err);
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                console.error('Error stopping scanner:', e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const handleQrScanned = async (decodedText) => {
        if (!selectedSession) return;

        // Temporarily pause scanner to prevent double submissions
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.pause(true);
        }

        try {
            const res = await axios.post('/eskul/attendance/scan', {
                session_uuid: selectedSession.uuid,
                token: decodedText,
            });

            if (res.data.success) {
                setScanResult({
                    success: true,
                    message: res.data.message,
                    student: res.data.student,
                });
                // Reload Inertia props to update attendances list
                router.reload({ only: ['attendances'] });
            } else {
                setScanResult({
                    success: false,
                    message: res.data.message || 'Gagal memproses QR.',
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Terjadi kesalahan pada validasi QR.';
            setScanResult({
                success: false,
                message: msg,
            });
        } finally {
            // Resume scanner after 1.5 seconds
            setTimeout(() => {
                if (scannerRef.current) {
                    try {
                        scannerRef.current.resume();
                    } catch (e) {}
                }
            }, 1500);
        }
    };

    const handleSessionChange = (uuid) => {
        router.visit(`/eskul/scanner?session=${uuid}`);
    };

    const openManualModal = (member) => {
        setSelectedMember(member);
        setManualData((prev) => ({
            ...prev,
            user_id: member.user_id,
            status: 'hadir',
            note: '',
        }));
        setManualModal(true);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        postManual('/eskul/attendance/manual', {
            onSuccess: () => {
                setManualModal(false);
                resetManual();
            },
        });
    };

    return (
        <AppLayout
            title="Scanner QR Presensi"
            header="Scanner Presensi QR Dinamis"
            subtitle="Pindai kode QR siswa secara langsung menggunakan kamera atau gunakan checklist manual jika terkendala."
        >
            {/* Session Selector Bar */}
            <div className="bg-white rounded-xl p-4 border border-[#D9E2EA] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#536170] mb-1">
                        Sesi Presensi Aktif
                    </label>
                    {openSessions.length === 0 ? (
                        <span className="text-sm font-bold text-[#E76F51]">
                            Tidak ada sesi kegiatan yang berstatus 'dibuka'. Buka sesi baru di Dashboard Eskul terlebih dahulu.
                        </span>
                    ) : (
                        <select
                            value={selectedSession?.uuid || ''}
                            onChange={(e) => handleSessionChange(e.target.value)}
                            className="block w-full sm:w-80 rounded-lg border border-[#D9E2EA] bg-white px-3 py-2 text-sm font-semibold text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        >
                            {openSessions.map((s) => (
                                <option key={s.id} value={s.uuid}>
                                    {s.extracurricular?.name}: {s.title} ({formatIndonesianDate(s.session_date)})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedSession && (
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('camera')}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'camera'
                                    ? 'bg-[#1769AA] text-white shadow-xs'
                                    : 'bg-white text-[#536170] hover:bg-[#F5F7FA] hover:text-[#123B5D] border border-[#D9E2EA]'
                            }`}
                        >
                            <Camera className="w-4 h-4 inline mr-1.5" />
                            Kamera Scanner
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'manual'
                                    ? 'bg-[#1769AA] text-white shadow-xs'
                                    : 'bg-white text-[#536170] hover:bg-[#F5F7FA] hover:text-[#123B5D] border border-[#D9E2EA]'
                            }`}
                        >
                            <CheckSquare className="w-4 h-4 inline mr-1.5" />
                            Checklist Manual ({members.length})
                        </button>
                    </div>
                )}
            </div>

            {selectedSession && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Scanner / Manual Tab */}
                    <div className="lg:col-span-7">
                        {activeTab === 'camera' ? (
                            <Card title="Arahkan Kamera ke QR Siswa" accentColor="blue" className="border-[#D9E2EA]">
                                {/* Result Alert Banner */}
                                {scanResult && (
                                    <div
                                        className={`mb-4 p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                                            scanResult.success
                                                ? 'bg-[#E4F4ED] border-[#2A9D6F]/30 text-[#2A9D6F]'
                                                : 'bg-[#FCE8E3] border-[#E76F51]/30 text-[#E76F51]'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {scanResult.success ? (
                                                <CheckCircle2 className="w-5 h-5 text-[#2A9D6F] shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-[#E76F51] shrink-0" />
                                            )}
                                            <span>{scanResult.message}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setScanResult(null)}
                                            className="p-1 text-[#536170] hover:text-[#17202A]"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Camera Viewport Container */}
                                <div className="relative rounded-xl overflow-hidden bg-[#123B5D] aspect-square max-w-sm mx-auto border-2 border-[#1769AA]">
                                    <div id="qr-reader" className="w-full h-full"></div>

                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs p-6 text-center">
                                            <CameraOff className="w-10 h-10 mb-2 text-[#4EA5D9]" />
                                            <span className="font-bold">Kamera belum aktif</span>
                                            <p className="text-[11px] text-[#E8F4FB] mt-1">
                                                Pastikan izin kamera browser telah diizinkan dan berjalan di HTTPS.
                                            </p>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="mt-4"
                                                onClick={startScanner}
                                            >
                                                Mulai Kamera
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-center text-xs text-[#536170] mt-4 font-medium">
                                    Arahkan kamera ke layar ponsel siswa. QR akan otomatis terdeteksi dalam &lt; 1 detik.
                                </p>
                            </Card>
                        ) : (
                            <Card
                                title="Checklist Manual Presensi"
                                subtitle="Gunakan jika siswa tidak membawa ponsel atau kamera bermasalah (wajib mengisi alasan)"
                                accentColor="yellow"
                                className="border-[#D9E2EA]"
                            >
                                <div className="divide-y divide-[#D9E2EA] max-h-[500px] overflow-y-auto">
                                    {members.map((m) => {
                                        const att = attendances.find((a) => a.user_id === m.user_id);
                                        return (
                                            <div
                                                key={m.id}
                                                className="py-3 flex items-center justify-between"
                                            >
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#17202A]">
                                                        {m.user?.name}
                                                    </h4>
                                                    <span className="text-[10px] text-[#536170] font-mono">
                                                        NISN: {m.user?.nisn || '-'} &bull; {m.position}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {att ? (
                                                        <Badge status={att.status}>{att.status}</Badge>
                                                    ) : (
                                                        <span className="text-[11px] text-[#536170] italic">
                                                            Belum Hadir
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => openManualModal(m)}
                                                    >
                                                        Ubah
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Side: Live Attendance List */}
                    <div className="lg:col-span-5">
                        <Card
                            title={`Tercatat Hadir (${attendances.length})`}
                            subtitle="Daftar kehadiran yang berhasil tervalidasi di sesi ini"
                            accentColor="green"
                            className="border-[#D9E2EA]"
                        >
                            {attendances.length === 0 ? (
                                <div className="text-center py-10 text-[#536170] text-xs">
                                    Belum ada siswa yang tercatat hadir. Pindai QR siswa untuk memulai.
                                </div>
                            ) : (
                                <div className="divide-y divide-[#D9E2EA] max-h-[500px] overflow-y-auto">
                                    {attendances.map((att) => (
                                        <div key={att.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-[#17202A]">
                                                    {att.student?.name}
                                                </div>
                                                <div className="text-[10px] text-[#536170]">
                                                    {formatIndonesianTime(att.recorded_at)} &bull;{' '}
                                                    <span className="uppercase font-mono font-semibold">{att.method}</span>
                                                </div>
                                            </div>
                                            <Badge status={att.status}>{att.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Modal Manual Attendance */}
            <Modal
                show={manualModal}
                onClose={() => setManualModal(false)}
                title="Input Presensi Manual"
                maxWidth="md"
            >
                <form onSubmit={handleManualSubmit} className="space-y-4">
                    {selectedMember && (
                        <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D9E2EA] text-xs">
                            <span className="text-[#536170] block text-[10px] font-bold uppercase">Nama Siswa:</span>
                            <span className="font-extrabold text-[#17202A] text-sm">{selectedMember.user?.name}</span>
                            <div className="text-[#536170] text-[11px] mt-0.5">NISN: {selectedMember.user?.nisn || '-'}</div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#536170] mb-1.5">
                            Status Kehadiran
                        </label>
                        <select
                            value={manualData.status}
                            onChange={(e) => setManualData('status', e.target.value)}
                            className="block w-full rounded-lg border border-[#D9E2EA] bg-white px-3 py-2 text-sm font-semibold text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        >
                            <option value="hadir">Hadir</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpa">Alpa</option>
                        </select>
                    </div>

                    <Input
                        id="note"
                        label="Alasan Perubahan Manual (Wajib)"
                        placeholder="Contoh: Ponsel siswa baterai habis / izin sakit ada surat dokter"
                        value={manualData.note}
                        onChange={(e) => setManualData('note', e.target.value)}
                        error={manualErrors.note}
                        required
                        autoFocus
                    />

                    <div className="pt-4 border-t border-[#D9E2EA] flex items-center justify-end gap-2">
                        <Button variant="secondary" onClick={() => setManualModal(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={manualProcessing}
                            disabled={!manualData.note}
                        >
                            Simpan Presensi
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
