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
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Sesi Presensi Aktif
                    </label>
                    {openSessions.length === 0 ? (
                        <span className="text-sm font-bold text-rose-600">
                            Tidak ada sesi kegiatan yang berstatus 'dibuka'. Buka sesi baru di Dashboard Eskul terlebih dahulu.
                        </span>
                    ) : (
                        <select
                            value={selectedSession?.uuid || ''}
                            onChange={(e) => handleSessionChange(e.target.value)}
                            className="block w-full sm:w-80 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                            {openSessions.map((s) => (
                                <option key={s.id} value={s.uuid}>
                                    {s.extracurricular?.name}: {s.title} ({s.session_date})
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
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'camera'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Camera className="w-4 h-4 inline mr-1.5" />
                            Kamera Scanner
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'manual'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                            <Card title="Arahkan Kamera ke QR Siswa" accentColor="primary">
                                {/* Result Alert Banner */}
                                {scanResult && (
                                    <div
                                        className={`mb-4 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                                            scanResult.success
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 animate-scan-success'
                                                : 'bg-rose-50 border-rose-200 text-rose-800 animate-scan-error'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {scanResult.success ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                            )}
                                            <span>{scanResult.message}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setScanResult(null)}
                                            className="p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Camera Viewport Container */}
                                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-w-sm mx-auto shadow-inner border-2 border-slate-700">
                                    <div id="qr-reader" className="w-full h-full"></div>

                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs p-6 text-center">
                                            <CameraOff className="w-10 h-10 mb-2 text-slate-400" />
                                            <span className="font-semibold">Kamera belum aktif</span>
                                            <p className="text-[11px] text-slate-400 mt-1">
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

                                <p className="text-center text-xs text-slate-500 mt-4">
                                    Arahkan kamera ke layar ponsel siswa. QR akan otomatis terdeteksi dalam &lt; 1 detik.
                                </p>
                            </Card>
                        ) : (
                            <Card
                                title="Checklist Manual Presensi"
                                subtitle="Gunakan jika siswa tidak membawa ponsel atau kamera bermasalah (wajib mengisi alasan)"
                                accentColor="accent"
                            >
                                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                    {members.map((m) => {
                                        const att = attendances.find((a) => a.user_id === m.user_id);
                                        return (
                                            <div
                                                key={m.id}
                                                className="py-3 flex items-center justify-between"
                                            >
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        {m.user?.name}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        NISN: {m.user?.nisn || '-'} &bull; {m.position}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {att ? (
                                                        <Badge status={att.status}>{att.status}</Badge>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Belum Hadir
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="outline"
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
                            accentColor="success"
                        >
                            {attendances.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    Belum ada siswa yang tercatat hadir. Pindai QR siswa untuk memulai.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                    {attendances.map((att) => (
                                        <div key={att.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">
                                                    {att.student?.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {att.recorded_at ? new Date(att.recorded_at).toLocaleTimeString('id-ID') : '-'} &bull;{' '}
                                                    <span className="uppercase font-mono">{att.method}</span>
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
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Nama Siswa:</span>
                            <span className="font-extrabold text-slate-900 text-sm">{selectedMember.user?.name}</span>
                            <div className="text-slate-500 text-[11px] mt-0.5">NISN: {selectedMember.user?.nisn || '-'}</div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Status Kehadiran
                        </label>
                        <select
                            value={manualData.status}
                            onChange={(e) => setManualData('status', e.target.value)}
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
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

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => setManualModal(false)}>
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
