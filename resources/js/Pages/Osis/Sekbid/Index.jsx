import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Compass,
    Shield,
    BookOpen,
    CheckCircle2,
    Users,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Building2,
    Award
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function OsisSekbidIndex({ sekbids = [] }) {
    const [expandedSekbid, setExpandedSekbid] = useState(null);

    const toggleExpand = (id) => {
        setExpandedSekbid(expandedSekbid === id ? null : id);
    };

    return (
        <AppLayout
            title="10 Seksi Bidang OSIS Standar Nasional"
            header="10 Seksi Bidang OSIS (Permendiknas No. 39 Tahun 2008)"
            subtitle="Struktur baku pembinaan kesiswaan nasional dan pemetaan ekstrakurikuler naungan resmi di sekolah."
            actions={
                <Link href="/osis/dashboard">
                    <Button variant="secondary" size="sm">
                        Kembali ke Dashboard
                    </Button>
                </Link>
            }
        >
            {/* Legal Notice Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-5 mb-6 text-white shadow-sm border border-blue-800">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold mb-2">
                    <Shield className="w-4 h-4" />
                    DASAR HUKUM KESISWAAN NASIONAL INDONESIA
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                    Peraturan Menteri Pendidikan Nasional Nomor 39 Tahun 2008
                </h2>
                <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
                    Berdasarkan <strong>Pasal 3 ayat (2) dan Lampiran Permendiknas No. 39/2008</strong>, materi pembinaan kesiswaan dijabarkan ke dalam 10 seksi bidang pembinaan kesiswaan untuk mengembangkan potensi siswa secara optimal, berakhlak mulia, cerdas, dan berwawasan kebangsaan.
                </p>
            </div>

            {/* Sekbid Cards Accordion Grid */}
            <div className="space-y-4">
                {sekbids.map((sekbid) => {
                    const isExpanded = expandedSekbid === sekbid.id;

                    return (
                        <Card
                            key={sekbid.id}
                            className={`border transition-all overflow-hidden ${
                                isExpanded ? 'border-blue-400 ring-2 ring-blue-500/10 shadow-md' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div
                                onClick={() => toggleExpand(sekbid.id)}
                                className="p-4 sm:p-5 cursor-pointer flex items-start sm:items-center justify-between gap-4 bg-white hover:bg-gray-50/50 select-none"
                            >
                                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1769AA] font-extrabold text-base flex items-center justify-center shrink-0 border border-blue-200">
                                        {sekbid.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <h3 className="text-base font-bold text-gray-900">
                                                {sekbid.short_title}
                                            </h3>
                                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                                Sekbid {sekbid.number}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-1 font-medium">
                                            {sekbid.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-semibold text-[#1769AA] hidden sm:inline">
                                        {isExpanded ? 'Tutup Rincian' : 'Lihat Rincian Tugas'}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/40 text-xs">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
                                        {/* Left 2 Cols: Official Duties */}
                                        <div className="lg:col-span-2 space-y-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-blue-900 mb-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 text-[#1769AA]" />
                                                    Tujuan Pembinaan
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                                                    {sekbid.description}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-blue-900 mb-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    Rincian Tugas & Program Kerja Resmi (Permendiknas No. 39/2008)
                                                </h4>
                                                <ul className="space-y-2 bg-white p-3.5 rounded-lg border border-gray-200">
                                                    {(sekbid.official_duties || []).map((duty, idx) => (
                                                        <li key={idx} className="flex items-start gap-2.5 text-gray-700 leading-relaxed">
                                                            <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1769AA] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                                                                {idx + 1}
                                                            </span>
                                                            <span>{duty}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Right Col: Extracurricular Alignments */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-blue-900 mb-2">
                                                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                                                Ekstrakurikuler & Organisasi Naungan
                                            </h4>
                                            <div className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                                                <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
                                                    Kegiatan kesiswaan di bawah koordinasi Sekbid {sekbid.number}:
                                                </p>
                                                {(sekbid.coordinating_eskuls || []).map((eskul, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2 rounded-md bg-purple-50/60 border border-purple-100 text-purple-900 font-medium flex items-center gap-2"
                                                    >
                                                        <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                                        <span>{eskul}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </AppLayout>
    );
}
