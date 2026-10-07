import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar,
    Users,
    ScanLine,
    PlusCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    ArrowRight
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';

export default function EskulDashboard({
    myEskuls = [],
    activeSessions = [],
    recentSessions = [],
}) {
    const [createModal, setCreateModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        extracurricular_id: myEskuls[0]?.id || '',
        title: '',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '15:30',
        end_time: '17:00',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/eskul/sessions', {
            onSuccess: () => {
                setCreateModal(false);
                reset();
            },
        });
    };

    const handleCloseSession = (uuid) => {
        if (confirm('Apakah Anda yakin ingin menutup sesi presensi ini? Presensi scan QR tidak akan diterima lagi setelah sesi ditutup.')) {
            router.post(`/eskul/sessions/${uuid}/close`);
        }
    };

    return (
        <AppLayout
            title="Dashboard Pengurus Eskul"
            header="Dashboard Ekstrakurikuler"
            subtitle="Kelola sesi kegiatan mingguan, buka presensi QR, dan rekap kehadiran anggota."
            actions={
                <div className="flex gap-2">
                    <Link href="/eskul/scanner">
                        <Button variant="primary" size="sm">
                            <ScanLine className="w-4 h-4 mr-1.5" />
                            Buka Scanner QR
                        </Button>
                    </Link>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            reset();
                            setCreateModal(true);
                        }}
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Buka Sesi Baru
                    </Button>
                </div>
            }
        >
            {/* Eskul Banner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {myEskuls.map((eskul) => (
                    <div
                        key={eskul.id}
                        className="bg-white rounded-lg p-5 border border-[#D9DEE3] shadow-xs flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-[#EAF2F8] text-[#1F4E79] flex items-center justify-center font-bold text-lg shrink-0">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#17212B]">{eskul.name}</h3>
                                <p className="text-xs text-[#737D86] mt-0.5 max-w-sm line-clamp-1">
                                    {eskul.description || 'Ekstrakurikuler aktif sekolah'}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center text-xs font-medium text-[#46515C] bg-[#F7F5F0] border border-[#D9DEE3] px-2.5 py-0.5 rounded-full">
                                        <Users className="w-3.5 h-3.5 mr-1 text-[#737D86]" />
                                        {eskul.members_count || 0} Anggota Aktif
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/eskul/members?eskul=${eskul.id}`}
                            className="p-2 rounded-md hover:bg-[#F7F5F0] text-[#737D86] hover:text-[#1F4E79] transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Active Sessions (Sesi Sedang Dibuka) */}
            <div className="mb-6">
                <Card
                    title="Sesi Kegiatan Aktif (Presensi Terbuka)"
                    subtitle="Siswa dapat memindai QR dinamis mereka sekarang"
                    accentColor="success"
                >
                    {activeSessions.length === 0 ? (
                        <div className="text-center py-8 text-[#737D86] text-sm">
                            Tidak ada sesi yang sedang dibuka saat ini. Klik "Buka Sesi Baru" untuk memulai kegiatan eskul.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 rounded-lg bg-[#EBF5F0] border border-[#287D5A]/30 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge status="dibuka">Sedang Dibuka</Badge>
                                            <span className="text-xs text-[#287D5A] font-semibold">
                                                {session.session_date}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-[#17212B]">{session.title}</h4>
                                        <p className="text-xs text-[#46515C] mt-1">
                                            {session.extracurricular?.name} &bull; Pukul {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                        </p>
                                        <div className="mt-3 text-xs font-semibold text-[#287D5A]">
                                            ✓ {session.attendances?.length || 0} Siswa sudah presensi
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-[#287D5A]/20 flex items-center justify-between gap-2">
                                        <Link href={`/eskul/scanner?session=${session.uuid}`}>
                                            <Button variant="success" size="sm">
                                                <ScanLine className="w-4 h-4 mr-1.5" />
                                                Scan QR Siswa
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCloseSession(session.uuid)}
                                        >
                                            Tutup Sesi
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Recent Sessions List */}
            <Card
                title="Riwayat Sesi Sebelumnya"
                subtitle="Daftar kegiatan yang telah diselesaikan"
                accentColor="primary"
            >
                {recentSessions.length === 0 ? (
                    <div className="text-center py-8 text-[#737D86] text-sm">
                        Belum ada riwayat sesi kegiatan sebelumnya.
                    </div>
                ) : (
                    <div className="divide-y divide-[#D9DEE3]">
                        {recentSessions.map((session) => (
                            <div key={session.id} className="py-3.5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#17212B]">{session.title}</h4>
                                    <p className="text-xs text-[#737D86] mt-0.5">
                                        {session.extracurricular?.name} &bull; {session.session_date} &bull; {session.attendances_count || 0} Hadir
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge status={session.status}>{session.status}</Badge>
                                    <Link
                                        href={`/eskul/rekap?session=${session.uuid}`}
                                        className="text-xs font-semibold text-[#1F4E79] hover:text-[#173A5C] px-2 py-1 rounded hover:bg-[#EAF2F8] transition-colors"
                                    >
                                        Rekap &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Modal Create Session */}
            <Modal
                show={createModal}
                onClose={() => setCreateModal(false)}
                title="Buka Sesi Kegiatan Baru"
                maxWidth="md"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {myEskuls.length > 1 && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#46515C] mb-1.5">
                                Pilih Ekstrakurikuler
                            </label>
                            <select
                                value={data.extracurricular_id}
                                onChange={(e) => setData('extracurricular_id', e.target.value)}
                                className="block w-full rounded-md border border-[#D9DEE3] bg-white px-3 py-2 text-sm text-[#17212B] focus:outline-none focus:border-[#1F4E79]"
                            >
                                {myEskuls.map((e) => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Input
                        id="title"
                        label="Judul / Topik Sesi Kegiatan"
                        placeholder="Contoh: Latihan Rutin & Materi Pioneering Tali Temali"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        error={errors.title}
                        required
                        autoFocus
                    />

                    <Input
                        id="session_date"
                        type="date"
                        label="Tanggal Kegiatan"
                        value={data.session_date}
                        onChange={(e) => setData('session_date', e.target.value)}
                        error={errors.session_date}
                        required
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            id="start_time"
                            type="time"
                            label="Jam Mulai"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            error={errors.start_time}
                            required
                        />
                        <Input
                            id="end_time"
                            type="time"
                            label="Jam Selesai"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            error={errors.end_time}
                            required
                        />
                    </div>

                    <div className="pt-4 border-t border-[#D9DEE3] flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateModal(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" loading={processing}>
                            Buka Sesi Presensi
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
