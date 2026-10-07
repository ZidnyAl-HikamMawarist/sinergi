import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Card from '../../Components/Card';
import StatCard from '../../Components/StatCard';
import Badge from '../../Components/Badge';
import { Users, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

export default function Analytics({ myEskuls, selectedEskul, selectedEskulId, analytics }) {
    const handleEskulChange = (e) => {
        router.get('/eskul/analytics', { eskul_id: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Analitik Kehadiran"
            workspace="eskul"
            header="Analitik Kehadiran Eskul"
            subtitle="Ringkasan tren kehadiran, tingkat partisipasi anggota, dan performa kegiatan"
        >
            <Head title="Analitik Kehadiran Eskul" />

            <div className="space-y-6">
                {/* Eskul Selector Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-[#D9DEE3]">
                    <div className="flex items-center gap-3">
                        <label htmlFor="eskul-filter" className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                            Pilih Eskul:
                        </label>
                        <select
                            id="eskul-filter"
                            value={selectedEskulId || ''}
                            onChange={handleEskulChange}
                            className="bg-white border border-[#D9DEE3] text-[#17212B] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
                        >
                            {myEskuls.map((eskul) => (
                                <option key={eskul.id} value={eskul.id}>
                                    {eskul.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-[#737D86]">
                        {selectedEskul ? `Data Akademik: ${selectedEskul.name}` : 'Tidak ada eskul aktif'}
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Anggota Aktif"
                        value={analytics.total_active_members}
                        icon={Users}
                        helperText="Siswa aktif terdaftar"
                    />
                    <StatCard
                        title="Total Sesi Kegiatan"
                        value={analytics.total_sessions}
                        icon={Calendar}
                        helperText="Sesi dalam tahun ajaran ini"
                    />
                    <StatCard
                        title="Rata-rata Kehadiran"
                        value={`${analytics.avg_attendance_rate}%`}
                        icon={TrendingUp}
                        helperText="Persentase kehadiran agregat"
                    />
                </div>

                {/* Participation Tiers Breakdown */}
                <Card title="Distribusi Tingkat Keaktifan Anggota">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-md border border-[#D1E7DD] bg-[#EBF5F0]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[#287D5A] uppercase tracking-wider">Keaktifan Tinggi</span>
                                <Badge variant="success">≥ 80%</Badge>
                            </div>
                            <div className="text-2xl font-bold text-[#287D5A]">{analytics.participation_tier.high}</div>
                            <p className="text-xs text-[#287D5A] mt-1">Siswa sangat disiplin mengikuti sesi</p>
                        </div>

                        <div className="p-4 rounded-md border border-[#FCE8B2] bg-[#FEF8EC]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[#B7791F] uppercase tracking-wider">Keaktifan Sedang</span>
                                <Badge variant="warning">50% - 79%</Badge>
                            </div>
                            <div className="text-2xl font-bold text-[#B7791F]">{analytics.participation_tier.moderate}</div>
                            <p className="text-xs text-[#B7791F] mt-1">Memerlukan dorongan konsistensi</p>
                        </div>

                        <div className="p-4 rounded-md border border-[#F8D7DA] bg-[#FDF2F2]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[#C24141] uppercase tracking-wider">Perlu Perhatian</span>
                                <Badge variant="danger">&lt; 50%</Badge>
                            </div>
                            <div className="text-2xl font-bold text-[#C24141]">{analytics.participation_tier.low}</div>
                            <p className="text-xs text-[#C24141] mt-1">Berpotensi drop-out dari keanggotaan</p>
                        </div>
                    </div>
                </Card>

                {/* Recent Sessions Trend Table */}
                <Card title="Riwayat Tren Kehadiran Sesi Terakhir">
                    {analytics.trend.length === 0 ? (
                        <div className="py-8 text-center text-sm text-[#737D86]">
                            Belum ada sesi kegiatan yang tercatat untuk eskul ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[#46515C]">
                                <thead className="bg-[#FCFBF9] text-xs uppercase tracking-wider text-[#737D86] border-b border-[#D9DEE3]">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Judul Sesi</th>
                                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                                        <th className="px-4 py-3 font-semibold text-center">Hadir / Total</th>
                                        <th className="px-4 py-3 font-semibold text-right">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D9DEE3]">
                                    {analytics.trend.map((s) => (
                                        <tr key={s.session_id} className="hover:bg-[#F7F5F0]">
                                            <td className="px-4 py-3 font-semibold text-[#17212B]">{s.title}</td>
                                            <td className="px-4 py-3 text-[#737D86]">{s.date}</td>
                                            <td className="px-4 py-3 text-center">
                                                {s.present_count} / {s.total_members}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-block font-bold ${
                                                    s.attendance_rate >= 80 ? 'text-[#287D5A]' : s.attendance_rate >= 50 ? 'text-[#B7791F]' : 'text-[#C24141]'
                                                }`}>
                                                    {s.attendance_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
