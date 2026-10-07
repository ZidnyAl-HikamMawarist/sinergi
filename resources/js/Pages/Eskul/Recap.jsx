import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import {
    CheckCircle2,
    Calendar,
    Users,
    Download,
    TrendingUp,
    FileSpreadsheet,
    Building2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function Recap({
    eskuls = [],
    selectedEskulId,
    selectedEskul,
    sessions = [],
    memberRecaps = [],
    stats = { total_sessions: 0, total_members: 0, avg_attendance_rate: 0 },
}) {
    const handleEskulChange = (e) => {
        router.get(window.location.pathname, { eskul_id: e.target.value }, { preserveState: true });
    };

    const handleExport = () => {
        if (!selectedEskulId) return;
        window.location.href = `/eskul/rekap/export?eskul_id=${selectedEskulId}`;
    };

    return (
        <AppLayout
            title="Rekap Kehadiran Eskul"
            header="Rekap Kehadiran"
            subtitle="Ringkasan persentase presensi anggota per ekstrakurikuler"
            actions={
                selectedEskul && (
                    <Button
                        onClick={handleExport}
                        variant="secondary"
                        className="flex items-center gap-2"
                        disabled={memberRecaps.length === 0}
                    >
                        <Download className="w-4 h-4 text-emerald-600" />
                        Export Rekap (CSV)
                    </Button>
                )
            }
        >
            <Head title="Rekap Kehadiran — SINERGI" />

            {/* Selector Filter Bar */}
            <Card className="mb-6 border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <label htmlFor="eskul-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                Pilih Ekstrakurikuler
                            </label>
                            <span className="text-sm font-semibold text-slate-900">
                                {selectedEskul ? selectedEskul.name : 'Pilih dari daftar'}
                            </span>
                        </div>
                    </div>

                    <div className="sm:w-64">
                        <select
                            id="eskul-select"
                            value={selectedEskulId || ''}
                            onChange={handleEskulChange}
                            className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        >
                            {eskuls.map((eskul) => (
                                <option key={eskul.id} value={eskul.id}>
                                    {eskul.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {selectedEskul ? (
                <div className="space-y-6">
                    {/* Summary Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="flex items-center space-x-4 border-l-4 border-l-blue-600">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sesi Kegiatan</p>
                                <p className="text-2xl font-extrabold text-slate-900">{stats.total_sessions}</p>
                                <p className="text-[11px] text-slate-500 font-medium">Sesi terlaksana th. ini</p>
                            </div>
                        </Card>

                        <Card className="flex items-center space-x-4 border-l-4 border-l-violet-600">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota Terdaftar</p>
                                <p className="text-2xl font-extrabold text-slate-900">{stats.total_members}</p>
                                <p className="text-[11px] text-slate-500 font-medium">Siswa anggota aktif</p>
                            </div>
                        </Card>

                        <Card className="flex items-center space-x-4 border-l-4 border-l-emerald-600">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Kehadiran</p>
                                <p className="text-2xl font-extrabold text-emerald-600">{stats.avg_attendance_rate}%</p>
                                <p className="text-[11px] text-slate-500 font-medium">Tingkat kehadiran siswa</p>
                            </div>
                        </Card>
                    </div>

                    {/* Member Attendance Table */}
                    <Card padding={false} className="overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tabel Rekap Kehadiran Anggota</h3>
                                <p className="text-xs text-slate-500">Dihitung dari seluruh sesi kegiatan yang telah dibuka</p>
                            </div>
                            <Badge variant="primary">{memberRecaps.length} Anggota</Badge>
                        </div>

                        {memberRecaps.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <h4 className="text-sm font-bold text-slate-700">Belum Ada Anggota Terdaftar</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                    Tambahkan anggota aktif ke ekstrakurikuler ini untuk melihat rekap kehadiran.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                            <th className="py-3 px-4">Nama Siswa</th>
                                            <th className="py-3 px-4">NISN</th>
                                            <th className="py-3 px-4">Kelas</th>
                                            <th className="py-3 px-4 text-center">Hadir</th>
                                            <th className="py-3 px-4 text-center">Izin</th>
                                            <th className="py-3 px-4 text-center">Sakit</th>
                                            <th className="py-3 px-4 text-center">Alpa</th>
                                            <th className="py-3 px-4 text-right">Persentase</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {memberRecaps.map((m) => (
                                            <tr key={m.user_id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                    {m.name}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                                                    {m.nisn}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    {m.class_name}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {m.hadir}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        {m.izin}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        {m.sakit}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        {m.alpa}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    m.attendance_rate >= 75
                                                                        ? 'bg-emerald-500'
                                                                        : m.attendance_rate >= 50
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-rose-500'
                                                                }`}
                                                                style={{ width: `${Math.min(100, m.attendance_rate)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-slate-800 font-mono text-xs">
                                                            {m.attendance_rate}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                <Card className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">Tidak Ada Ekstrakurikuler</h3>
                    <p className="text-xs text-slate-500 mt-1">Anda belum ditugaskan ke ekstrakurikuler aktif manapun.</p>
                </Card>
            )}
        </AppLayout>
    );
}
