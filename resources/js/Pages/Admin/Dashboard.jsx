import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Building2,
    Calendar,
    CreditCard,
    ArrowUpRight,
    FileSpreadsheet,
    Shield,
    Clock,
    PlusCircle
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function AdminDashboard({
    stats = {},
    recentSessions = [],
    recentLogs = [],
}) {
    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AppLayout
            title="Dashboard Admin OSIS"
            header="Dashboard Admin OSIS"
            subtitle="Ringkasan aktivitas ekstrakurikuler, keanggotaan siswa, dan keuangan organisasi."
            actions={
                <div className="flex gap-2">
                    <Link href="/admin/import">
                        <Button variant="secondary" size="sm">
                            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#1769AA]" />
                            Import Siswa
                        </Button>
                    </Link>
                    <Link href="/admin/eskul/create">
                        <Button variant="primary" size="sm">
                            <PlusCircle className="w-4 h-4 mr-1.5" />
                            Tambah Eskul
                        </Button>
                    </Link>
                </div>
            }
        >
            {/* 4 Core Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Siswa Aktif"
                    value={stats.totalStudents || 0}
                    subtitle="Terdaftar di sistem"
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Eskul Aktif"
                    value={stats.totalEskul || 0}
                    subtitle="Organisasi & kesiswaan"
                    icon={Building2}
                    color="primary"
                />
                <StatCard
                    title="Sesi Kegiatan"
                    value={stats.totalSessions || 0}
                    subtitle="Tercatat periode ini"
                    icon={Calendar}
                    color="success"
                />
                <StatCard
                    title="Saldo Kas OSIS"
                    value={formatRupiah(stats.cashBalance)}
                    subtitle="Akuntabel & terverifikasi"
                    icon={CreditCard}
                    color="accent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sessions */}
                <div className="lg:col-span-2">
                    <Card
                        title="Sesi Kegiatan Terbaru"
                        subtitle="Pantau kegiatan eskul yang sedang atau baru selesai digelar"
                        accentColor="primary"
                        action={
                            <Link
                                href="/eskul/sessions"
                                className="text-xs font-bold text-[#1769AA] hover:text-[#0F4F82]"
                            >
                                Lihat Semua &rarr;
                            </Link>
                        }
                    >
                        {recentSessions.length === 0 ? (
                            <div className="text-center py-8 text-[#718096] text-sm">
                                Belum ada sesi kegiatan yang tercatat pada periode ini.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D7E0E8]">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="py-3.5 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-md bg-[#E8F2FA] text-[#123B5D] flex items-center justify-center font-bold text-xs shrink-0">
                                                <Calendar className="w-5 h-5 text-[#1769AA]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[#17202A]">
                                                    {session.title}
                                                </h4>
                                                <p className="text-xs text-[#718096] mt-0.5">
                                                    {session.extracurricular?.name} &bull; {session.session_date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Badge status={session.status}>{session.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Audit Logs Quick View */}
                <div>
                    <Card
                        title="Audit Log Sistem"
                        subtitle="Catatan keamanan mutlak (append-only)"
                        accentColor="primary"
                        action={
                            <Link
                                href="/admin/audit-logs"
                                className="text-xs font-bold text-[#1769AA] hover:text-[#0F4F82]"
                            >
                                Log Lengkap &rarr;
                            </Link>
                        }
                    >
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8 text-[#718096] text-sm">
                                Belum ada catatan audit.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {recentLogs.map((log) => (
                                    <div key={log.id} className="p-3 rounded-lg bg-[#F3F8FC] border border-[#D7E0E8] text-xs">
                                        <div className="flex items-center justify-between font-bold text-[#17202A]">
                                            <span className="capitalize">{log.action.replace('_', ' ')}</span>
                                            <span className="text-[10px] text-[#718096] font-normal">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-[#465362] mt-1 flex items-center justify-between text-[11px]">
                                            <span>Oleh: {log.user?.name || 'Sistem'}</span>
                                            <span className="font-mono text-[#718096]">{log.entity_type}</span>
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
