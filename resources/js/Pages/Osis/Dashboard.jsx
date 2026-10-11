import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Compass,
    Building2,
    Calendar,
    CreditCard,
    ArrowUpRight,
    FolderArchive,
    Shield,
    Clock,
    PlusCircle,
    CheckCircle2,
    ChevronRight,
    FileText,
    Users
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { formatIndonesianDate, formatIndonesianTime, formatRupiah } from '@/Utils/format';

export default function OsisDashboard({
    stats = {},
    sekbids = [],
    recentLetters = [],
    recentSessions = [],
}) {
    return (
        <AppLayout
            title="Dashboard Presidium OSIS"
            header="Dashboard Presidium & Pengurus OSIS"
            subtitle="Pusat koordinasi 10 Seksi Bidang Permendiknas 39/2008, E-Arsip surat menyurat, dan pembinaan kesiswaan."
            actions={
                <div className="flex gap-2">
                    <Link href="/osis/arsip">
                        <Button variant="secondary" size="sm">
                            <FolderArchive className="w-4 h-4 mr-1.5" />
                            E-Arsip Surat
                        </Button>
                    </Link>
                    <Link href="/osis/sekbid">
                        <Button variant="primary" size="sm">
                            <Compass className="w-4 h-4 mr-1.5" />
                            10 Sekbid Standar
                        </Button>
                    </Link>
                </div>
            }
        >
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="10 Seksi Bidang"
                    value={stats.totalSekbids || 10}
                    subtitle="Standar Permendiknas 39/2008"
                    icon={Compass}
                    color="blue"
                />
                <StatCard
                    title="Eskul Naungan"
                    value={stats.totalEskuls || 0}
                    subtitle="Ekstrakurikuler aktif sekolah"
                    icon={Building2}
                    color="emerald"
                />
                <StatCard
                    title="E-Arsip Surat"
                    value={stats.totalLetters || 0}
                    subtitle="Surat masuk & keluar tersimpan"
                    icon={FolderArchive}
                    color="amber"
                />
                <StatCard
                    title="Saldo Kas OSIS"
                    value={formatRupiah(stats.cashBalance || 0)}
                    subtitle="Akuntabilitas kas organisasi"
                    icon={CreditCard}
                    color="purple"
                />
            </div>

            {/* Quick Banner: Official Mandate Info */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 mb-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
                        <Shield className="w-3.5 h-3.5" />
                        Regulasi Resmi Kesiswaan Nasional
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                        Permendiknas Nomor 39 Tahun 2008 tentang Pembinaan Kesiswaan
                    </h3>
                    <p className="text-blue-100/90 text-sm mt-1 max-w-3xl leading-relaxed">
                        Struktur dan rincian program kerja 10 Seksi Bidang OSIS pada sistem SINERGI disusun secara ketat berdasarkan ketetapan hukum Pasal 3 & Lampiran Permendiknas No. 39/2008 tanpa improvisasi fiktif.
                    </p>
                </div>
                <Link href="/osis/sekbid" className="shrink-0">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        Buka Matriks Sekbid
                        <ArrowUpRight className="w-4 h-4 ml-1.5" />
                    </Button>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 10 Sekbid Overview (2 Columns on Desktop) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-[#1769AA]" />
                            Matriks 10 Seksi Bidang OSIS
                        </h2>
                        <Link href="/osis/sekbid" className="text-xs font-medium text-[#1769AA] hover:underline flex items-center">
                            Detail Tugas Lengkap <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {sekbids.map((sekbid) => (
                            <Card key={sekbid.id} className="p-4 hover:border-blue-300 transition-all shadow-xs border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1769AA] font-bold text-sm flex items-center justify-center shrink-0 border border-blue-100">
                                        {sekbid.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {sekbid.short_title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                            {sekbid.name}
                                        </p>
                                        
                                        {/* Coordinating Eskul Badges */}
                                        <div className="mt-2.5 flex flex-wrap gap-1">
                                            {(sekbid.coordinating_eskuls || []).slice(0, 2).map((eskul, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700"
                                                >
                                                    {eskul}
                                                </span>
                                            ))}
                                            {(sekbid.coordinating_eskuls || []).length > 2 && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500">
                                                    +{(sekbid.coordinating_eskuls || []).length - 2} lainnya
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: Recent Letters & Activity Monitoring */}
                <div className="space-y-6">
                    {/* Recent Letters */}
                    <Card className="p-4 border border-gray-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <FolderArchive className="w-4 h-4 text-amber-600" />
                                E-Arsip Surat Terkini
                            </h3>
                            <Link href="/osis/arsip" className="text-xs text-[#1769AA] hover:underline">
                                Buka E-Arsip
                            </Link>
                        </div>

                        {recentLetters.length === 0 ? (
                            <p className="text-xs text-gray-500 py-4 text-center">Belum ada rekaman surat terarsip.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 mt-2">
                                {recentLetters.map((letter) => (
                                    <div key={letter.id} className="py-2.5 text-xs">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-mono font-medium text-gray-800 truncate">
                                                {letter.reference_number}
                                            </span>
                                            <Badge
                                                variant={letter.type === 'masuk' ? 'info' : 'primary'}
                                                className="text-[10px] uppercase font-semibold"
                                            >
                                                {letter.type}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 font-medium line-clamp-1">
                                            {letter.subject}
                                        </p>
                                        <div className="flex items-center justify-between text-gray-400 text-[11px] mt-1">
                                            <span>{letter.sender_or_recipient}</span>
                                            <span>{formatIndonesianDate(letter.letter_date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Recent Activity Sessions */}
                    <Card className="p-4 border border-gray-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                Aktivitas Eskul
                            </h3>
                            <Link href="/eskul/sessions" className="text-xs text-[#1769AA] hover:underline">
                                Lihat Kalender
                            </Link>
                        </div>

                        {recentSessions.length === 0 ? (
                            <p className="text-xs text-gray-500 py-4 text-center">Belum ada sesi kegiatan eskul.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 mt-2">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="py-2.5 text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-900">
                                                {session.extracurricular?.name}
                                            </span>
                                            <Badge variant={session.status === 'open' ? 'success' : 'secondary'} className="text-[10px]">
                                                {session.status === 'open' ? 'Berlangsung' : 'Selesai'}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 line-clamp-1">{session.title}</p>
                                        <div className="text-gray-400 text-[11px] mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatIndonesianDate(session.activity_date)}
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
