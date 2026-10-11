import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    FolderArchive,
    FileText,
    PlusCircle,
    Search,
    Filter,
    Download,
    Eye,
    UploadCloud,
    CheckCircle2,
    Clock,
    Sparkles,
    X,
    FileCheck,
    Send,
    Inbox,
    RefreshCw
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { formatIndonesianDate } from '@/Utils/format';

export default function LetterArchiveIndex({
    letters = { data: [] },
    stats = { total: 0, masuk: 0, keluar: 0 },
    filters = {},
    suggestedReference = '',
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form for creating new letter
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'keluar',
        reference_number: suggestedReference || '',
        classification_code: 'UND',
        sender_or_recipient: '',
        subject: '',
        letter_date: new Date().toISOString().slice(0, 10),
        received_or_sent_date: new Date().toISOString().slice(0, 10),
        description: '',
        status: 'disetujui',
        file: null,
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/osis/arsip', {
            search,
            type: typeFilter === 'all' ? undefined : typeFilter,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }, { preserveState: true });
    };

    const handleTypeChange = (newType) => {
        setTypeFilter(newType);
        router.get('/osis/arsip', {
            search,
            type: newType === 'all' ? undefined : newType,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }, { preserveState: true });
    };

    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get('/osis/arsip', {
            search,
            type: typeFilter === 'all' ? undefined : typeFilter,
            status: newStatus === 'all' ? undefined : newStatus,
        }, { preserveState: true });
    };

    const generateNomor = async (classification) => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/osis/arsip/generate-nomor?classification=${encodeURIComponent(classification || data.classification_code)}`);
            const json = await res.json();
            if (json.reference_number) {
                setData('reference_number', json.reference_number);
            }
        } catch (err) {
            console.error('Gagal generate nomor surat', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        post('/osis/arsip', {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleStatusUpdate = (uuid, newStatus) => {
        if (!confirm(`Konfirmasi pembaruan status surat menjadi "${newStatus}"?`)) return;
        router.post(`/osis/arsip/${uuid}/status`, { status: newStatus });
    };

    return (
        <AppLayout
            title="E-Arsip Surat OSIS"
            header="E-Arsip Persuratan & Tata Kelola OSIS"
            subtitle="Pusat pencatatan, penomoran otomatis, dan pengarsipan digital surat masuk & surat keluar OSIS."
            actions={
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        reset();
                        setModalOpen(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Catat Surat Baru
                </Button>
            }
        >
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Terarsip</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Surat masuk & keluar</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FolderArchive className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Surat Masuk</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.masuk || 0}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Dari dinas, sekolah & luar</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Inbox className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Surat Keluar</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{stats.keluar || 0}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Penomoran resmi OSIS</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Send className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Tabs Type Filter */}
                    <div className="flex p-1 bg-gray-100 rounded-lg text-xs font-medium w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('all')}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                typeFilter === 'all' ? 'bg-white shadow-xs text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Semua Surat ({stats.total || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('masuk')}
                            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                                typeFilter === 'masuk' ? 'bg-white shadow-xs text-emerald-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Inbox className="w-3.5 h-3.5" />
                            Surat Masuk ({stats.masuk || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('keluar')}
                            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                                typeFilter === 'keluar' ? 'bg-white shadow-xs text-purple-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            Surat Keluar ({stats.keluar || 0})
                        </button>
                    </div>

                    {/* Search and Status Filter */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md justify-end">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className="text-xs border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2"
                        >
                            <option value="all">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="diajukan">Diajukan</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="diarsipkan">Diarsipkan</option>
                        </select>

                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nomor, perihal, atau instansi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Cari
                        </Button>
                    </form>
                </div>
            </Card>

            {/* Letters Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">No. Surat</th>
                                <th className="px-4 py-3">Tipe</th>
                                <th className="px-4 py-3">Pengirim / Tujuan</th>
                                <th className="px-4 py-3">Perihal</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Berkas & Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {letters.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-gray-400">
                                        <FolderArchive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        Tidak ada rekaman surat yang sesuai dengan kriteria filter.
                                    </td>
                                </tr>
                            ) : (
                                letters.data.map((letter) => (
                                    <tr key={letter.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                                            {letter.reference_number}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Badge
                                                variant={letter.type === 'masuk' ? 'success' : 'primary'}
                                                className="text-[10px] uppercase font-semibold"
                                            >
                                                {letter.type === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {letter.sender_or_recipient}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate" title={letter.subject}>
                                            <span className="font-medium text-gray-900">{letter.subject}</span>
                                            {letter.description && (
                                                <p className="text-[11px] text-gray-400 truncate mt-0.5">{letter.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>{formatIndonesianDate(letter.letter_date)}</div>
                                            <div className="text-[10px] text-gray-400">
                                                {letter.type === 'masuk' ? 'Diterima: ' : 'Dikirim: '}
                                                {formatIndonesianDate(letter.received_or_sent_date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Badge
                                                variant={
                                                    letter.status === 'diarsipkan' ? 'success' :
                                                    letter.status === 'disetujui' ? 'primary' :
                                                    letter.status === 'diajukan' ? 'warning' : 'secondary'
                                                }
                                                className="text-[10px] capitalize"
                                            >
                                                {letter.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {letter.file_path ? (
                                                    <a
                                                        href={`/osis/arsip/${letter.uuid}/file`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[11px] font-medium"
                                                        title="Buka / Unduh Berkas Lampiran"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                                        Berkas
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic px-2">Tanpa Berkas</span>
                                                )}

                                                {letter.status !== 'diarsipkan' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusUpdate(letter.uuid, 'diarsipkan')}
                                                        className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium"
                                                        title="Tandai Sudah Diarsipkan"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Arsipkan
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {letters.links && letters.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Menampilkan {letters.from || 0} - {letters.to || 0} dari {letters.total || 0} surat</span>
                        <div className="flex gap-1">
                            {letters.links.map((link, idx) => (
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
            </Card>

            {/* Modal: Catat Surat Baru */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FolderArchive className="w-5 h-5 text-[#1769AA]" />
                                <h3 className="text-base font-bold text-gray-900">Catat Dokumen Surat OSIS</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                            {/* Type Selector */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1.5">Jenis Dokumen Surat</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('type', 'keluar');
                                            generateNomor(data.classification_code);
                                        }}
                                        className={`p-3 rounded-lg border text-center font-medium transition-all flex items-center justify-center gap-2 ${
                                            data.type === 'keluar'
                                                ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20 font-bold'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Send className="w-4 h-4" />
                                        Surat Keluar OSIS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('type', 'masuk');
                                            setData('reference_number', '');
                                        }}
                                        className={`p-3 rounded-lg border text-center font-medium transition-all flex items-center justify-center gap-2 ${
                                            data.type === 'masuk'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Inbox className="w-4 h-4" />
                                        Surat Masuk
                                    </button>
                                </div>
                            </div>

                            {/* Classification & Reference Number */}
                            {data.type === 'keluar' ? (
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Klasifikasi</label>
                                        <select
                                            value={data.classification_code}
                                            onChange={(e) => {
                                                setData('classification_code', e.target.value);
                                                generateNomor(e.target.value);
                                            }}
                                            className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="UND">UND (Undangan)</option>
                                            <option value="SK">SK (Surat Keputusan)</option>
                                            <option value="PENG">PENG (Pengumuman)</option>
                                            <option value="NOT">NOT (Notulen)</option>
                                            <option value="MOU">MOU (Kerjasama)</option>
                                            <option value="PERM">PERM (Permohonan)</option>
                                            <option value="LAP">LAP (Laporan)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="font-semibold text-gray-700">Nomor Surat Resmi</label>
                                            <button
                                                type="button"
                                                onClick={() => generateNomor(data.classification_code)}
                                                className="text-[11px] text-[#1769AA] hover:underline flex items-center gap-1 font-medium"
                                                disabled={isGenerating}
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                                Generate Otomatis
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            placeholder="001/OSIS/UND/X/2026"
                                            className="w-full font-mono text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.reference_number && <p className="text-red-600 text-[11px] mt-1">{errors.reference_number}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Nomor Surat Asal</label>
                                    <input
                                        type="text"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="Contoh: 421/045/Disdik/X/2026"
                                        className="w-full font-mono text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.reference_number && <p className="text-red-600 text-[11px] mt-1">{errors.reference_number}</p>}
                                </div>
                            )}

                            {/* Sender or Recipient */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">
                                    {data.type === 'keluar' ? 'Tujuan Surat (Instansi / Nama Penerima)' : 'Asal Pengirim Surat'}
                                </label>
                                <input
                                    type="text"
                                    value={data.sender_or_recipient}
                                    onChange={(e) => setData('sender_or_recipient', e.target.value)}
                                    placeholder={data.type === 'keluar' ? 'Contoh: Kepala Sekolah SMAN 1 / Seluruh Ketua Sekbid' : 'Contoh: Kwartir Ranting Gerakan Pramuka'}
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.sender_or_recipient && <p className="text-red-600 text-[11px] mt-1">{errors.sender_or_recipient}</p>}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Perihal Surat</label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Contoh: Undangan Rapat Pleno Koordinasi Program Kerja Triwulan I"
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.subject && <p className="text-red-600 text-[11px] mt-1">{errors.subject}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tanggal Surat</label>
                                    <input
                                        type="date"
                                        value={data.letter_date}
                                        onChange={(e) => setData('letter_date', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.letter_date && <p className="text-red-600 text-[11px] mt-1">{errors.letter_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        {data.type === 'keluar' ? 'Tanggal Pengiriman' : 'Tanggal Diterima'}
                                    </label>
                                    <input
                                        type="date"
                                        value={data.received_or_sent_date}
                                        onChange={(e) => setData('received_or_sent_date', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.received_or_sent_date && <p className="text-red-600 text-[11px] mt-1">{errors.received_or_sent_date}</p>}
                                </div>
                            </div>

                            {/* Description / Disposition */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Catatan Disposisi / Ringkasan Isi</label>
                                <textarea
                                    rows="2"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Keterangan singkat, agenda, atau instruksi tindak lanjut..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description}</p>}
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Unggah Berkas Scan / Dokumen (PDF, JPG, PNG maks 5 MB)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('file', e.target.files[0])}
                                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg p-1.5"
                                />
                                {errors.file && <p className="text-red-600 text-[11px] mt-1">{errors.file}</p>}
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalOpen(false)}
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
                                    <FileCheck className="w-4 h-4 mr-1.5" />
                                    {processing ? 'Menyimpan...' : 'Simpan ke E-Arsip'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
