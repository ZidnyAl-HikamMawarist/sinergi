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
                            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
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
            {/* 4 Core Stat Cards with Semantic Accents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Siswa Aktif"
                    value={stats.totalStudents || 0}
                    subtitle="Terdaftar di sistem"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Eskul Aktif"
                    value={stats.totalEskul || 0}
                    subtitle="Organisasi & kesiswaan"
                    icon={Building2}
                    color="green"
                />
                <StatCard
                    title="Sesi Kegiatan"
                    value={stats.totalSessions || 0}
                    subtitle="Tercatat periode ini"
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Saldo Kas OSIS"
                    value={formatRupiah(stats.cashBalance)}
                    subtitle="Akuntabel & terverifikasi"
                    icon={CreditCard}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sessions */}
                <div className="lg:col-span-2">
                    <Card
                        title="Sesi Kegiatan Terbaru"
                        subtitle="Pantau kegiatan eskul yang sedang atau baru selesai digelar"
                        accentColor="blue"
                        action={
                            <Link
                                href="/eskul/sessions"
                                className="text-xs font-bold text-[#1769AA] hover:text-[#0F4F82] flex items-center gap-1"
                            >
                                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        }
                    >
                        {recentSessions.length === 0 ? (
                            <div className="text-center py-8 text-[#536170] text-sm">
                                Belum ada sesi kegiatan yang tercatat pada periode ini.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D9E2EA]">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="py-3.5 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#E8F4FB] text-[#1769AA] flex items-center justify-center font-bold text-xs shrink-0">
                                                <Calendar className="w-5 h-5 text-[#1769AA]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[#17202A]">
                                                    {session.title}
                                                </h4>
                                                <p className="text-xs text-[#536170] mt-0.5">
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
                        accentColor="coral"
                        action={
                            <Link
                                href="/admin/audit-logs"
                                className="text-xs font-bold text-[#1769AA] hover:text-[#0F4F82] flex items-center gap-1"
                            >
                                Log Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        }
                    >
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8 text-[#536170] text-sm">
                                Belum ada catatan audit.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {recentLogs.map((log) => (
                                    <div key={log.id} className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D9E2EA] text-xs">
                                        <div className="flex items-center justify-between font-bold text-[#17202A]">
                                            <span className="capitalize">{log.action.replace('_', ' ')}</span>
                                            <span className="text-[10px] text-[#536170] font-normal">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-[#536170] mt-1 flex items-center justify-between text-[11px]">
                                            <span>Oleh: <strong>{log.user?.name || 'Sistem'}</strong></span>
                                            <span className="font-mono text-[10px] text-[#536170] px-1.5 py-0.5 rounded bg-white border border-[#D9E2EA]">{log.entity_type}</span>
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
