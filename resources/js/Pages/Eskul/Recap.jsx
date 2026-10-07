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
            <Card className="mb-6 border-[#D7E0E8] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md bg-[#123B5D] text-white flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <label htmlFor="eskul-select" className="text-xs font-bold text-[#718096] uppercase tracking-wider block">
                                Pilih Ekstrakurikuler
                            </label>
                            <span className="text-sm font-bold text-[#17202A]">
                                {selectedEskul ? selectedEskul.name : 'Pilih dari daftar'}
                            </span>
                        </div>
                    </div>

                    <div className="sm:w-64">
                        <select
                            id="eskul-select"
                            value={selectedEskulId || ''}
                            onChange={handleEskulChange}
                            className="w-full text-sm font-medium border border-[#D7E0E8] rounded-md px-3 py-2 bg-white text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] shadow-xs"
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
                        <Card className="flex items-center space-x-4 border-l-4 border-l-[#1769AA] border-[#D7E0E8]">
                            <div className="w-10 h-10 rounded-md bg-[#E8F2FA] text-[#123B5D] flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Total Sesi Kegiatan</p>
                                <p className="text-2xl font-extrabold text-[#17202A]">{stats.total_sessions}</p>
                                <p className="text-[11px] text-[#718096] font-medium">Sesi terlaksana th. ini</p>
                            </div>
                        </Card>

                        <Card className="flex items-center space-x-4 border-l-4 border-l-[#123B5D] border-[#D7E0E8]">
                            <div className="w-10 h-10 rounded-md bg-[#E8F2FA] text-[#123B5D] flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Anggota Terdaftar</p>
                                <p className="text-2xl font-extrabold text-[#17202A]">{stats.total_members}</p>
                                <p className="text-[11px] text-[#718096] font-medium">Siswa anggota aktif</p>
                            </div>
                        </Card>

                        <Card className="flex items-center space-x-4 border-l-4 border-l-[#25805A] border-[#D7E0E8]">
                            <div className="w-10 h-10 rounded-md bg-[#EBF5F0] text-[#25805A] flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Rata-Rata Kehadiran</p>
                                <p className="text-2xl font-extrabold text-[#25805A]">{stats.avg_attendance_rate}%</p>
                                <p className="text-[11px] text-[#718096] font-medium">Tingkat kehadiran siswa</p>
                            </div>
                        </Card>
                    </div>

                    {/* Member Attendance Table */}
                    <Card padding={false} className="overflow-hidden border-[#D7E0E8]">
                        <div className="p-4 sm:p-5 border-b border-[#D7E0E8] flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-[#17202A]">Tabel Rekap Kehadiran Anggota</h3>
                                <p className="text-xs text-[#718096]">Dihitung dari seluruh sesi kegiatan yang telah dibuka</p>
                            </div>
                            <Badge variant="primary">{memberRecaps.length} Anggota</Badge>
                        </div>

                        {memberRecaps.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-12 h-12 mx-auto text-[#718096] mb-3" />
                                <h4 className="text-sm font-bold text-[#17202A]">Belum Ada Anggota Terdaftar</h4>
                                <p className="text-xs text-[#718096] max-w-sm mx-auto mt-1">
                                    Tambahkan anggota aktif ke ekstrakurikuler ini untuk melihat rekap kehadiran.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-[#F3F8FC] border-b border-[#D7E0E8] text-[#718096] font-bold uppercase tracking-wider text-[11px]">
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
                                    <tbody className="divide-y divide-[#D7E0E8]">
                                        {memberRecaps.map((m) => (
                                             <tr key={m.user_id} className="hover:bg-[#F3F8FC]/60 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-[#17202A]">
                                                    {m.name}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-[#718096] text-xs">
                                                    {m.nisn}
                                                </td>
                                                <td className="py-3.5 px-4 text-[#465362]">
                                                    {m.class_name}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#EBF5F0] text-[#25805A] border border-[#25805A]/30">
                                                        {m.hadir}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF8EC] text-[#B7791F] border border-[#B7791F]/30">
                                                        {m.izin}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F2FA] text-[#123B5D] border border-[#1769AA]/30">
                                                        {m.sakit}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FDF2F2] text-[#C24141] border border-[#C24141]/30">
                                                        {m.alpa}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <div className="w-16 bg-[#D7E0E8] rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-1.5 rounded-full ${
                                                                    m.attendance_rate >= 75
                                                                        ? 'bg-[#25805A]'
                                                                        : m.attendance_rate >= 50
                                                                        ? 'bg-[#B7791F]'
                                                                        : 'bg-[#C24141]'
                                                                }`}
                                                                style={{ width: `${Math.min(100, m.attendance_rate)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-[#17202A] font-mono text-xs">
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
                <Card className="text-center py-12 border-[#D7E0E8]">
                    <AlertCircle className="w-12 h-12 text-[#718096] mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#17202A]">Tidak Ada Ekstrakurikuler</h3>
                    <p className="text-xs text-[#718096] mt-1">Anda belum ditugaskan ke ekstrakurikuler aktif manapun.</p>
                </Card>
            )}
        </AppLayout>
    );
}
