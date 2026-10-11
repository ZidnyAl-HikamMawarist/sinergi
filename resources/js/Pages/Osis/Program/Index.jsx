import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import {
    Target,
    Compass,
    PlusCircle,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    PlayCircle,
    Users,
    Calendar,
    CreditCard,
    MessageSquare,
    Check,
    X,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { formatIndonesianDate, formatRupiah } from '@/Utils/format';

export default function OsisProgramIndex({
    programs = { data: [] },
    sekbids = [],
    stats = { total: 0, disetujui: 0, diajukan: 0, terlaksana: 0 },
    filters = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const canReview = user?.is_super_admin || user?.is_admin || user?.is_presidium;

    const [search, setSearch] = useState(filters.search || '');
    const [sekbidFilter, setSekbidFilter] = useState(filters.sekbid_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    // Form for new program
    const { data, setData, post, processing, errors, reset } = useForm({
        osis_sekbid_id: sekbids[0]?.id || '',
        name: '',
        description: '',
        target_audience: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        estimated_budget: 0,
    });

    // Form for review / approve
    const reviewForm = useForm({
        decision: 'disetujui',
        approval_note: '',
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/osis/program', {
            search,
            sekbid_id: sekbidFilter || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }, { preserveState: true });
    };

    const handleFilterChange = (sekbid, status) => {
        router.get('/osis/program', {
            search,
            sekbid_id: sekbid || undefined,
            status: status === 'all' ? undefined : status,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/osis/program', {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!selectedProgram) return;

        reviewForm.post(`/osis/program/${selectedProgram.uuid}/approve`, {
            onSuccess: () => {
                setReviewModalOpen(false);
                setSelectedProgram(null);
                reviewForm.reset();
            },
        });
    };

    const handleStatusTransition = (uuid, nextStatus) => {
        if (!confirm(`Konfirmasi pembaruan status program kerja menjadi "${nextStatus}"?`)) return;
        router.post(`/osis/program/${uuid}/status`, { status: nextStatus });
    };

    return (
        <AppLayout
            title="Program Kerja 10 Sekbid OSIS"
            header="Program Kerja Seksi Bidang 1 s.d. 10"
            subtitle="Perencanaan, pengajuan anggaran, dan monitoring program kerja OSIS berbasis standar Permendiknas 39/2008."
            actions={
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        reset();
                        setCreateModalOpen(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Usulkan Program Kerja
                </Button>
            }
        >
            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-blue-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Program</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Semua sekbid 1-10</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menunggu Review</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.diajukan || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Diajukan ke Presidium</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disetujui</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.disetujui || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Siap dilaksanakan</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Terlaksana</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{stats.terlaksana || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Telah diselesaikan</p>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4 mb-6">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Sekbid selector */}
                    <div className="md:col-span-4">
                        <select
                            value={sekbidFilter}
                            onChange={(e) => {
                                setSekbidFilter(e.target.value);
                                handleFilterChange(e.target.value, statusFilter);
                            }}
                            className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        >
                            <option value="">Semua Seksi Bidang (Sekbid 1 - 10)</option>
                            {sekbids.map((s) => (
                                <option key={s.id} value={s.id}>
                                    Sekbid {s.number}: {s.short_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status selector */}
                    <div className="md:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                handleFilterChange(sekbidFilter, e.target.value);
                            }}
                            className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value="diajukan">Diajukan</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="berjalan">Berjalan</option>
                            <option value="terlaksana">Terlaksana</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                    </div>

                    {/* Search query input */}
                    <div className="md:col-span-4 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari judul proker, sasaran..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <Button type="submit" variant="secondary" size="sm" className="w-full justify-center">
                            Cari
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Programs List */}
            <div className="space-y-3.5">
                {programs.data.length === 0 ? (
                    <Card className="p-10 text-center text-gray-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Belum ada program kerja yang sesuai kriteria pencarian.</p>
                    </Card>
                ) : (
                    programs.data.map((prog) => (
                        <Card key={prog.id} className="p-4 sm:p-5 hover:border-blue-200 transition-all border border-gray-200">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1769AA] border border-blue-200">
                                            Sekbid {prog.sekbid?.number}
                                        </span>
                                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                            {prog.name}
                                        </h3>
                                        <Badge
                                            variant={
                                                prog.status === 'disetujui' ? 'primary' :
                                                prog.status === 'diajukan' ? 'warning' :
                                                prog.status === 'terlaksana' ? 'success' :
                                                prog.status === 'berjalan' ? 'info' : 'secondary'
                                            }
                                            className="text-[10px] capitalize font-bold"
                                        >
                                            {prog.status}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                        {prog.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                                        <span className="flex items-center gap-1 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {formatIndonesianDate(prog.start_date)} s.d. {formatIndonesianDate(prog.end_date)}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            Sasaran: {prog.target_audience}
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                                            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                                            Anggaran: {formatRupiah(prog.estimated_budget || 0)}
                                        </span>
                                    </div>

                                    {/* Review note if exists */}
                                    {prog.approval_note && (
                                        <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                                            <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold">Catatan Review Presidium: </span>
                                                <span>{prog.approval_note}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                    {/* Review button for Presidium */}
                                    {canReview && prog.status === 'diajukan' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedProgram(prog);
                                                reviewForm.setData('decision', 'disetujui');
                                                reviewForm.setData('approval_note', '');
                                                setReviewModalOpen(true);
                                            }}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                            Review & Putuskan
                                        </Button>
                                    )}

                                    {/* Status progress for PIC */}
                                    {prog.status === 'disetujui' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleStatusTransition(prog.uuid, 'berjalan')}
                                        >
                                            <PlayCircle className="w-4 h-4 mr-1.5 text-blue-600" />
                                            Mulai Berjalan
                                        </Button>
                                    )}

                                    {prog.status === 'berjalan' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => handleStatusTransition(prog.uuid, 'terlaksana')}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                            Tandai Terlaksana
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}

                {/* Pagination */}
                {programs.links && programs.links.length > 3 && (
                    <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Menampilkan {programs.from || 0} - {programs.to || 0} dari {programs.total || 0} program kerja</span>
                        <div className="flex gap-1">
                            {programs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                        link.active
                                            ? 'bg-[#1769AA] text-white font-semibold'
                                            : !link.url
                                            ? 'text-gray-300 pointer-events-none'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Usulkan Program Kerja Baru */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#1769AA]" />
                                <h3 className="text-base font-bold text-gray-900">Usulan Program Kerja Baru</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
                            {/* Sekbid Selector */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Seksi Bidang (Permendiknas 39/2008)</label>
                                <select
                                    value={data.osis_sekbid_id}
                                    onChange={(e) => setData('osis_sekbid_id', e.target.value)}
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    required
                                >
                                    {sekbids.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            Sekbid {s.number}: {s.short_title} ({s.name})
                                        </option>
                                    ))}
                                </select>
                                {errors.osis_sekbid_id && <p className="text-red-600 text-[11px] mt-1">{errors.osis_sekbid_id}</p>}
                            </div>

                            {/* Program Name */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Nama Program Kerja</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Workshop Literasi Digital & Pemrograman Web Pelajar"
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.name && <p className="text-red-600 text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Latar Belakang & Deskripsi Kegiatan</label>
                                <textarea
                                    rows="3"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan tujuan, rangkaian kegiatan, dan hasil yang diharapkan..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description}</p>}
                            </div>

                            {/* Target Audience & Budget */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Sasaran Peserta</label>
                                    <input
                                        type="text"
                                        value={data.target_audience}
                                        onChange={(e) => setData('target_audience', e.target.value)}
                                        placeholder="Contoh: Seluruh Siswa Kelas X & XI"
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.target_audience && <p className="text-red-600 text-[11px] mt-1">{errors.target_audience}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Estimasi Anggaran (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="50000"
                                        value={data.estimated_budget}
                                        onChange={(e) => setData('estimated_budget', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        required
                                    />
                                    {errors.estimated_budget && <p className="text-red-600 text-[11px] mt-1">{errors.estimated_budget}</p>}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.start_date && <p className="text-red-600 text-[11px] mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.end_date && <p className="text-red-600 text-[11px] mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCreateModalOpen(false)}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Ajukan ke Presidium OSIS'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Review & Approval Presidium */}
            {reviewModalOpen && selectedProgram && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-900">
                                Review Usulan Proker: {selectedProgram.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 text-xs">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                                <p className="font-semibold text-gray-900">Sekbid {selectedProgram.sekbid?.number}: {selectedProgram.sekbid?.short_title}</p>
                                <p className="text-gray-600">{selectedProgram.description}</p>
                                <p className="font-bold text-purple-700 pt-1">
                                    Anggaran Diajukan: {formatRupiah(selectedProgram.estimated_budget || 0)}
                                </p>
                            </div>

                            {/* Decision */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1.5">Keputusan Presidium</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => reviewForm.setData('decision', 'disetujui')}
                                        className={`p-3 rounded-lg border text-center font-bold flex items-center justify-center gap-2 ${
                                            reviewForm.data.decision === 'disetujui'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        Setujui Program
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => reviewForm.setData('decision', 'dibatalkan')}
                                        className={`p-3 rounded-lg border text-center font-bold flex items-center justify-center gap-2 ${
                                            reviewForm.data.decision === 'dibatalkan'
                                                ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <X className="w-4 h-4 text-rose-600" />
                                        Tolak / Batalkan
                                    </button>
                                </div>
                            </div>

                            {/* Approval Note */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Catatan Disposisi / Rekomendasi</label>
                                <textarea
                                    rows="3"
                                    value={reviewForm.data.approval_note}
                                    onChange={(e) => reviewForm.setData('approval_note', e.target.value)}
                                    placeholder="Contoh: Disetujui. Koordinasikan sarpras lapangan dengan pembina..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setReviewModalOpen(false)}
                                    disabled={reviewForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={reviewForm.processing}
                                >
                                    {reviewForm.processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
