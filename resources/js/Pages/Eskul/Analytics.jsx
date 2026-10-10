import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import {
    Users,
    Calendar,
    TrendingUp,
    AlertTriangle,
    Award,
    CheckCircle2,
    BarChart3
} from 'lucide-react';

export default function Analytics({
    myEskuls = [],
    selectedEskul = null,
    selectedEskulId = null,
    analytics = {
        total_active_members: 0,
        total_sessions: 0,
        avg_attendance_rate: 0,
        trend: [],
        participation_tier: { high: 0, moderate: 0, low: 0 },
        members_at_risk: [],
        top_active_members: [],
    },
}) {
    const handleEskulChange = (e) => {
        router.get(
            '/eskul/analytics',
            { eskul_id: e.target.value },
            { preserveState: true }
        );
    };

    const hasData = Boolean(selectedEskul);
    const hasSessions = analytics.total_sessions > 0;

    return (
        <AppLayout
            title="Analitik Kehadiran"
            header="Analitik Kehadiran Eskul"
            subtitle="Ringkasan tren kehadiran, tingkat partisipasi anggota, dan performa kegiatan"
        >
            <Head title="Analitik Kehadiran Eskul" />

            <div className="space-y-6">
                {/* Eskul Selector Filter Card */}
                <div className="bg-white rounded-xl border border-[#D9E2EA] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <label
                            htmlFor="eskul-filter"
                            className="text-xs font-bold text-[#123B5D] uppercase tracking-wider shrink-0"
                        >
                            Pilih Ekstrakurikuler:
                        </label>
                        {myEskuls.length > 0 ? (
                            <select
                                id="eskul-filter"
                                value={selectedEskulId || ''}
                                onChange={handleEskulChange}
                                className="bg-white border border-[#D9E2EA] text-[#17202A] text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition-all shadow-xs max-w-xs"
                            >
                                {myEskuls.map((eskul) => (
                                    <option key={eskul.id} value={eskul.id}>
                                        {eskul.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-xs font-semibold text-[#536170]">
                                Tidak ada ekstrakurikuler yang dapat dikelola
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-[#536170] flex items-center gap-2">
                        {selectedEskul ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5F7FA] border border-[#D9E2EA] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#2A9D6F]" />
                                Data Aktif: <strong className="text-[#123B5D]">{selectedEskul.name}</strong>
                            </span>
                        ) : null}
                    </div>
                </div>

                {!hasData ? (
                    <Card padding={true} className="text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-[#E8F4FB] text-[#1769AA] flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[#123B5D]">Tidak Ada Ekstrakurikuler Terpilih</h3>
                        <p className="text-xs text-[#536170] mt-1 max-w-md mx-auto">
                            Silakan pilih ekstrakurikuler melalui menu di atas untuk melihat analitik kehadiran.
                        </p>
                    </Card>
                ) : (
                    <>
                        {/* KPI Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                title="Total Anggota Aktif"
                                value={analytics.total_active_members}
                                subtitle="Siswa terdaftar aktif pada TA berjalan"
                                icon={Users}
                                color="blue"
                            />
                            <StatCard
                                title="Total Sesi Kegiatan"
                                value={analytics.total_sessions}
                                subtitle="Sesi terlaksana pada TA berjalan"
                                icon={Calendar}
                                color="primary"
                            />
                            <StatCard
                                title="Rata-rata Kehadiran"
                                value={`${analytics.avg_attendance_rate}%`}
                                subtitle="Persentase kehadiran agregat seluruh sesi"
                                icon={TrendingUp}
                                color={
                                    analytics.avg_attendance_rate >= 80
                                        ? 'success'
                                        : analytics.avg_attendance_rate >= 50
                                          ? 'warning'
                                          : 'danger'
                                }
                            />
                        </div>

                        {/* Participation Tiers Breakdown */}
                        <Card
                            title="Distribusi Tingkat Keaktifan Anggota"
                            subtitle="Klasifikasi kehadiran anggota berdasarkan akumulasi sesi kegiatan"
                            accentColor="primary"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl border border-[#C5E8D8] bg-[#F0F9F5]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#1B6D4C] uppercase tracking-wider">
                                            Keaktifan Tinggi
                                        </span>
                                        <Badge variant="success">≥ 80%</Badge>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#1B6D4C]">
                                        {analytics.participation_tier?.high ?? 0}
                                    </div>
                                    <p className="text-xs font-medium text-[#2A9D6F] mt-1">
                                        Anggota sangat disiplin dan konsisten hadir
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-[#FCE7BA] bg-[#FFFBF0]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#8C5D07] uppercase tracking-wider">
                                            Keaktifan Sedang
                                        </span>
                                        <Badge variant="warning">50% - 79%</Badge>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#8C5D07]">
                                        {analytics.participation_tier?.moderate ?? 0}
                                    </div>
                                    <p className="text-xs font-medium text-[#B27B10] mt-1">
                                        Memerlukan dorongan konsistensi kehadiran
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-[#FADCD6] bg-[#FDF2F0]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#A63C24] uppercase tracking-wider">
                                            Perlu Perhatian
                                        </span>
                                        <Badge variant="danger">&lt; 50%</Badge>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#A63C24]">
                                        {analytics.participation_tier?.low ?? 0}
                                    </div>
                                    <p className="text-xs font-medium text-[#E76F51] mt-1">
                                        Berisiko tinggi putus kegiatan/keanggotaan
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Actionable Student Breakdown Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Members At Risk (<50%) */}
                            <Card
                                title="Perlu Pendampingan Khusus (< 50%)"
                                subtitle="Daftar anggota dengan tingkat kehadiran terendah untuk ditindaklanjuti pengurus"
                                accentColor="danger"
                            >
                                {analytics.members_at_risk?.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-[#2A9D6F] font-semibold flex flex-col items-center gap-1.5">
                                        <CheckCircle2 className="w-5 h-5 text-[#2A9D6F]" />
                                        <span>Semua anggota aktif memiliki tingkat kehadiran di atas 50%.</span>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-5 -my-2">
                                        <table className="w-full text-left text-xs text-[#17202A]">
                                            <thead className="bg-[#F5F7FA] text-[#536170] uppercase font-bold text-[10px] border-b border-[#D9E2EA]">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2.5">Nama & NISN</th>
                                                    <th scope="col" className="px-3 py-2.5">Kelas</th>
                                                    <th scope="col" className="px-3 py-2.5 text-center">Hadir / Sesi</th>
                                                    <th scope="col" className="px-4 py-2.5 text-right">Persentase</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#D9E2EA]">
                                                {analytics.members_at_risk.map((item) => (
                                                    <tr key={item.id} className="hover:bg-[#FDF2F0]/50 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            <div className="font-bold text-[#123B5D]">{item.name}</div>
                                                            <div className="text-[10px] text-[#536170]">NISN: {item.nisn}</div>
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-[#536170]">
                                                            {item.class_name}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center font-semibold">
                                                            {item.present_sessions} / {item.total_sessions}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <Badge variant="danger">{item.attendance_rate}%</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            {/* Top Consistent Members (>=80%) */}
                            <Card
                                title="Anggota Paling Disiplin (≥ 80%)"
                                subtitle="Apresiasi konsistensi kehadiran anggota eskul"
                                accentColor="success"
                            >
                                {analytics.top_active_members?.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-[#536170]">
                                        Belum ada anggota yang mencapai ambang batas kehadiran 80%.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-5 -my-2">
                                        <table className="w-full text-left text-xs text-[#17202A]">
                                            <thead className="bg-[#F5F7FA] text-[#536170] uppercase font-bold text-[10px] border-b border-[#D9E2EA]">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2.5">Nama & NISN</th>
                                                    <th scope="col" className="px-3 py-2.5">Kelas</th>
                                                    <th scope="col" className="px-3 py-2.5 text-center">Hadir / Sesi</th>
                                                    <th scope="col" className="px-4 py-2.5 text-right">Persentase</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#D9E2EA]">
                                                {analytics.top_active_members.map((item) => (
                                                    <tr key={item.id} className="hover:bg-[#F0F9F5]/50 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            <div className="font-bold text-[#123B5D] flex items-center gap-1.5">
                                                                <Award className="w-3.5 h-3.5 text-[#2A9D6F]" />
                                                                {item.name}
                                                            </div>
                                                            <div className="text-[10px] text-[#536170]">NISN: {item.nisn}</div>
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-[#536170]">
                                                            {item.class_name}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center font-semibold">
                                                            {item.present_sessions} / {item.total_sessions}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <Badge variant="success">{item.attendance_rate}%</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Recent Sessions Trend Table */}
                        <Card
                            title="Riwayat Tren Kehadiran Sesi Terakhir"
                            subtitle="Rekapitulasi partisipasi pada maksimal 8 sesi kegiatan terbaru"
                            accentColor="neutral"
                        >
                            {!hasSessions || analytics.trend?.length === 0 ? (
                                <div className="py-8 text-center text-xs text-[#536170]">
                                    Belum ada sesi kegiatan yang tercatat untuk eskul ini pada tahun ajaran aktif.
                                </div>
                            ) : (
                                <div className="overflow-x-auto -mx-5 -my-2">
                                    <table className="w-full text-left text-xs text-[#17202A]">
                                        <thead className="bg-[#F5F7FA] text-[#536170] uppercase font-bold text-[10px] border-b border-[#D9E2EA]">
                                            <tr>
                                                <th scope="col" className="px-4 py-3">Judul Sesi</th>
                                                <th scope="col" className="px-4 py-3">Tanggal Pelaksanaan</th>
                                                <th scope="col" className="px-4 py-3 text-center">Hadir / Total Anggota</th>
                                                <th scope="col" className="px-4 py-3 text-right">Tingkat Kehadiran</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#D9E2EA]">
                                            {analytics.trend.map((s) => (
                                                <tr key={s.session_id} className="hover:bg-[#F5F7FA] transition-colors">
                                                    <td className="px-4 py-3 font-bold text-[#123B5D]">{s.title}</td>
                                                    <td className="px-4 py-3 text-[#536170]">{s.date}</td>
                                                    <td className="px-4 py-3 text-center font-semibold text-[#17202A]">
                                                        {s.present_count} / {s.total_members}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Badge
                                                            variant={
                                                                s.attendance_rate >= 80
                                                                    ? 'success'
                                                                    : s.attendance_rate >= 50
                                                                      ? 'warning'
                                                                      : 'danger'
                                                            }
                                                        >
                                                            {s.attendance_rate}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
