import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    ArrowUpCircle,
    ArrowDownCircle,
    PlusCircle,
    Eye,
    Ban,
    FileText,
    UploadCloud,
    CheckCircle2,
    Calendar,
    AlertCircle,
    BookOpen,
    FileSpreadsheet,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';

export default function KasDashboard({
    stats = {},
    transactions = { data: [] },
    categories = [],
}) {
    const { url } = usePage();
    const activeTab = url.includes('/kas/laporan')
        ? 'laporan'
        : url.includes('/kas/kategori')
        ? 'kategori'
        : 'mutasi';

    const [createModal, setCreateModal] = useState(false);
    const [voidModal, setVoidModal] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    // Form for creating new transaction
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        type: 'masuk',
        cash_category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        proof: null,
    });

    // Form for voiding transaction
    const {
        data: voidData,
        setData: setVoidData,
        post: postVoid,
        processing: voidProcessing,
        errors: voidErrors,
        reset: resetVoid,
    } = useForm({
        void_reason: '',
    });

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate('/kas/transactions', {
            onSuccess: () => {
                setCreateModal(false);
                resetCreate();
            },
        });
    };

    const handleOpenVoid = (tx) => {
        setSelectedTx(tx);
        setVoidData('void_reason', '');
        setVoidModal(true);
    };

    const handleVoidSubmit = (e) => {
        e.preventDefault();
        if (!selectedTx) return;

        postVoid(`/kas/transactions/${selectedTx.uuid}/void`, {
            onSuccess: () => {
                setVoidModal(false);
                setSelectedTx(null);
                resetVoid();
            },
        });
    };

    const filteredCategories = categories.filter((c) => c.type === createData.type);

    return (
        <AppLayout
            title="Buku Kas Digital"
            header="Buku Kas OSIS (Digital & Immutable)"
            subtitle="Pencatatan kas organisasi anti-manipulasi. Setiap transaksi wajib berbukti dan tidak dapat diedit."
            actions={
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        resetCreate();
                        setCreateModal(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Catat Transaksi Baru
                </Button>
            }
        >
            {/* Saldo Hero Banner - Institutional Solid */}
            <div className="bg-[#123B5D] rounded-lg p-5 sm:p-6 text-white shadow-xs mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-[#0F2F4A]">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Saldo Kas Aktif (Dihitung Server)
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                        {formatRupiah(stats.balance)}
                    </h2>
                    <p className="text-xs text-slate-300/80 mt-1">
                        Perhitungan server-side murni dari seluruh transaksi valid pada tahun ajaran ini.
                    </p>
                </div>

                <div className="flex sm:flex-col gap-2.5 shrink-0">
                    <div className="bg-[#0F2F4A] px-3.5 py-2 rounded-md border border-white/15">
                        <span className="text-[11px] text-[#48BB78] font-bold block">Total Pemasukan</span>
                        <span className="text-xs font-bold text-white">+{formatRupiah(stats.totalIn)}</span>
                    </div>
                    <div className="bg-[#0F2F4A] px-3.5 py-2 rounded-md border border-white/15">
                        <span className="text-[11px] text-[#FEB2B2] font-bold block">Total Pengeluaran</span>
                        <span className="text-xs font-bold text-white">-{formatRupiah(stats.totalOut)}</span>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <StatCard
                    title="Transaksi Valid"
                    value={stats.validCount || 0}
                    icon={CheckCircle2}
                    color="success"
                />
                <StatCard
                    title="Transaksi Void"
                    value={stats.voidCount || 0}
                    icon={Ban}
                    color="danger"
                />
                <StatCard
                    title="Kategori Aktif"
                    value={categories.length || 0}
                    icon={CreditCard}
                    color="primary"
                />
                <StatCard
                    title="Total Arus Kas"
                    value={formatRupiah((stats.totalIn || 0) + (stats.totalOut || 0))}
                    icon={FileText}
                    color="neutral"
                />
            </div>

            {/* Sub-view Navigation Tabs */}
            <div className="flex items-center gap-2 mb-5 border-b border-[#D7E0E8] pb-2.5">
                <Button
                    variant={activeTab === 'mutasi' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => router.get('/kas/dashboard')}
                >
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    Mutasi Transaksi
                </Button>
                <Button
                    variant={activeTab === 'laporan' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => router.get('/kas/laporan')}
                >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                    Laporan Ringkasan
                </Button>
                <Button
                    variant={activeTab === 'kategori' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => router.get('/kas/kategori')}
                >
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Kategori Kas ({categories.length})
                </Button>
            </div>

            {/* TAB 1: KATEGORI KAS */}
            {activeTab === 'kategori' && (
                <Card
                    title="Kategori Akun Kas"
                    subtitle="Daftar pos anggaran resmi pemasukan dan pengeluaran kas OSIS"
                    accentColor="primary"
                    className="border-[#D7E0E8]"
                >
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left text-xs text-[#465362]">
                            <thead className="bg-[#F3F8FC] text-[#718096] font-bold border-y border-[#D7E0E8] uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-5 py-3">Nama Kategori</th>
                                    <th className="px-5 py-3">Arus Transaksi</th>
                                    <th className="px-5 py-3">Sifat Akun</th>
                                    <th className="px-5 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D7E0E8]">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-[#F3F8FC]/60 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-[#17202A]">
                                            {cat.name}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {cat.type === 'masuk' ? (
                                                <span className="inline-flex items-center text-[#25805A] font-bold text-xs">
                                                    <ArrowDownCircle className="w-3.5 h-3.5 mr-1 text-[#25805A]" />
                                                    Pemasukan (Masuk)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[#C24141] font-bold text-xs">
                                                    <ArrowUpCircle className="w-3.5 h-3.5 mr-1 text-[#C24141]" />
                                                    Pengeluaran (Keluar)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-[#718096]">
                                            {cat.is_system ? 'Kategori Bawaan Sistem' : 'Kategori Kustom Organisasi'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Badge status="aktif">Aktif</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TAB 2: LAPORAN RINGKASAN */}
            {activeTab === 'laporan' && (
                <Card
                    title="Laporan Ringkasan Arus Kas"
                    subtitle="Akumulasi realisasi keuangan organisasi per kategori transaksi"
                    accentColor="primary"
                    className="border-[#D7E0E8]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#EBF5F0] border border-[#25805A]/30 rounded-lg p-4">
                            <span className="text-xs font-bold text-[#25805A] uppercase tracking-wider block">Total Realisasi Masuk</span>
                            <span className="text-2xl font-extrabold text-[#25805A] mt-1 block">+{formatRupiah(stats.totalIn)}</span>
                        </div>
                        <div className="bg-[#FDF2F2] border border-[#C24141]/30 rounded-lg p-4">
                            <span className="text-xs font-bold text-[#C24141] uppercase tracking-wider block">Total Realisasi Keluar</span>
                            <span className="text-2xl font-extrabold text-[#C24141] mt-1 block">-{formatRupiah(stats.totalOut)}</span>
                        </div>
                        <div className="bg-[#E8F2FA] border border-[#1769AA]/30 rounded-lg p-4">
                            <span className="text-xs font-bold text-[#123B5D] uppercase tracking-wider block">Surplus / Saldo Bersih</span>
                            <span className="text-2xl font-extrabold text-[#123B5D] mt-1 block">{formatRupiah(stats.balance)}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left text-xs text-[#465362]">
                            <thead className="bg-[#F3F8FC] text-[#718096] font-bold border-y border-[#D7E0E8] uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-5 py-3">Pos Kategori</th>
                                    <th className="px-5 py-3">Tipe</th>
                                    <th className="px-5 py-3 text-right">Status Valid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D7E0E8]">
                                {categories.map((c) => (
                                    <tr key={c.id} className="hover:bg-[#F3F8FC]/60 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-[#17202A]">{c.name}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`font-bold ${c.type === 'masuk' ? 'text-[#25805A]' : 'text-[#C24141]'}`}>
                                                {c.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-medium text-[#718096]">
                                            Tersinkronisasi
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TAB 3: BUKU BESAR TRANSAKSI (MUTASI) */}
            {activeTab === 'mutasi' && (
                <Card
                    title="Buku Besar Transaksi"
                    subtitle="Daftar mutasi keuangan terbaru berurutan tanggal"
                    accentColor="primary"
                    className="border-[#D7E0E8]"
                >
                    {transactions.data.length === 0 ? (
                        <div className="text-center py-12 text-[#718096] text-sm">
                            Belum ada mutasi kas pada periode ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-5">
                            <table className="w-full text-left text-xs text-[#465362]">
                                <thead className="bg-[#F3F8FC] text-[#718096] font-bold border-y border-[#D7E0E8] uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3">Kategori & Keterangan</th>
                                        <th className="px-5 py-3">Arus</th>
                                        <th className="px-5 py-3">Nominal</th>
                                        <th className="px-5 py-3">Bukti</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D7E0E8]">
                                    {transactions.data.map((tx) => {
                                        const isVoid = tx.status === 'void';
                                        return (
                                            <tr
                                                key={tx.id}
                                                className={`transition-colors hover:bg-[#F3F8FC]/60 ${
                                                    isVoid ? 'bg-[#F6F8FB] opacity-60' : ''
                                                }`}
                                            >
                                                <td className="px-5 py-3.5 font-medium text-[#465362] whitespace-nowrap">
                                                    {tx.transaction_date}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className={`font-bold text-[#17202A] ${isVoid ? 'line-through' : ''}`}>
                                                        {tx.category?.name}
                                                    </div>
                                                    <div className="text-[#718096] text-[11px] mt-0.5 max-w-xs truncate">
                                                        {tx.description}
                                                    </div>
                                                    {isVoid && tx.void_reason && (
                                                        <div className="text-[#C24141] text-[10px] mt-0.5 font-medium">
                                                            Alasan void: {tx.void_reason} (oleh {tx.voider?.name})
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {tx.type === 'masuk' ? (
                                                        <span className="inline-flex items-center text-[#25805A] font-bold">
                                                            <ArrowDownCircle className="w-4 h-4 mr-1 text-[#25805A]" />
                                                            Masuk
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[#C24141] font-bold">
                                                            <ArrowUpCircle className="w-4 h-4 mr-1 text-[#C24141]" />
                                                            Keluar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-5 py-3.5 font-bold whitespace-nowrap ${isVoid ? 'line-through text-[#718096]' : tx.type === 'masuk' ? 'text-[#25805A]' : 'text-[#17202A]'}`}>
                                                    {tx.type === 'masuk' ? '+' : '-'}{formatRupiah(tx.amount)}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {tx.proof_path ? (
                                                        <a
                                                            href={`/kas/transactions/${tx.uuid}/proof`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center text-[#1769AA] hover:text-[#0F4F82] font-bold"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 mr-1" />
                                                            Lihat Bukti
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#718096]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Badge status={tx.status}>{tx.status}</Badge>
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    {!isVoid ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenVoid(tx)}
                                                            className="inline-flex items-center text-[#C24141] hover:text-[#A83232] font-bold hover:bg-[#FDF2F2] px-2 py-1 rounded transition-colors"
                                                        >
                                                            <Ban className="w-3.5 h-3.5 mr-1" />
                                                            Void
                                                        </button>
                                                    ) : (
                                                        <span className="text-[#718096] text-[11px] italic">Dibatalkan</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* Modal Create Transaction */}
            <Modal
                show={createModal}
                onClose={() => setCreateModal(false)}
                title="Catat Transaksi Kas Baru"
                maxWidth="lg"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {/* Tipe Transaksi Tab */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#465362] mb-1.5">
                            Jenis Transaksi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCreateData('type', 'masuk')}
                                className={`py-2 rounded-md font-bold text-xs flex items-center justify-center transition-all ${
                                    createData.type === 'masuk'
                                        ? 'bg-[#25805A] text-white shadow-xs'
                                        : 'bg-white text-[#465362] border border-[#D7E0E8] hover:bg-[#F3F8FC]'
                                }`}
                            >
                                <ArrowDownCircle className="w-4 h-4 mr-1.5" />
                                Pemasukan (Masuk)
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateData('type', 'keluar')}
                                className={`py-2 rounded-md font-bold text-xs flex items-center justify-center transition-all ${
                                    createData.type === 'keluar'
                                        ? 'bg-[#C24141] text-white shadow-xs'
                                        : 'bg-white text-[#465362] border border-[#D7E0E8] hover:bg-[#F3F8FC]'
                                }`}
                            >
                                <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                                Pengeluaran (Keluar)
                            </button>
                        </div>
                    </div>

                    {/* Kategori Dropdown */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#465362] mb-1.5">
                            Kategori Kas <span className="text-[#C24141]">*</span>
                        </label>
                        <select
                            value={createData.cash_category_id}
                            onChange={(e) => setCreateData('cash_category_id', e.target.value)}
                            required
                            className="block w-full rounded-md border border-[#D7E0E8] bg-white px-3 py-2 text-sm font-semibold text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {createErrors.cash_category_id && (
                            <p className="mt-1 text-xs text-[#C24141] font-medium">
                                {createErrors.cash_category_id}
                            </p>
                        )}
                    </div>

                    {/* Nominal */}
                    <Input
                        id="amount"
                        type="number"
                        min="1000"
                        step="1000"
                        label="Nominal (Rupiah)"
                        placeholder="Contoh: 150000"
                        value={createData.amount}
                        onChange={(e) => setCreateData('amount', e.target.value)}
                        error={createErrors.amount}
                        required
                    />

                    {/* Tanggal Transaksi */}
                    <Input
                        id="transaction_date"
                        type="date"
                        label="Tanggal Transaksi"
                        value={createData.transaction_date}
                        onChange={(e) => setCreateData('transaction_date', e.target.value)}
                        error={createErrors.transaction_date}
                        required
                    />

                    {/* Keterangan */}
                    <Input
                        id="description"
                        label="Keterangan / Rincian"
                        placeholder="Contoh: Pembelian spanduk LDKS OSIS 2026"
                        value={createData.description}
                        onChange={(e) => setCreateData('description', e.target.value)}
                        error={createErrors.description}
                        required
                    />

                    {/* Upload Bukti Wajib (AC-E1) */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#465362] mb-1.5">
                            Unggah Bukti Transaksi <span className="text-[#C24141]">* (Wajib)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            required
                            onChange={(e) => setCreateData('proof', e.target.files[0])}
                            className="block w-full text-xs text-[#465362] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#E8F2FA] file:text-[#123B5D] hover:file:bg-[#D7E0E8]"
                        />
                        <p className="mt-1 text-[11px] text-[#718096]">
                            Format JPG, PNG, atau PDF. Maksimal 5 MB. Bukti akan disimpan aman di private storage.
                        </p>
                        {createErrors.proof && (
                            <p className="mt-1 text-xs text-[#C24141] font-medium">{createErrors.proof}</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-[#D7E0E8] flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateModal(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={createProcessing}
                            disabled={!createData.proof || !createData.amount || !createData.cash_category_id}
                        >
                            Simpan Transaksi
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Void Transaction */}
            <Modal
                show={voidModal}
                onClose={() => setVoidModal(false)}
                title="Konfirmasi Void Transaksi"
                maxWidth="md"
            >
                <form onSubmit={handleVoidSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#C24141]/30 text-[#C24141] text-xs">
                        <div className="flex items-center space-x-2 font-bold mb-1">
                            <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0" />
                            <span>Perhatian: Transaksi Kas Bersifat Immutable</span>
                        </div>
                        Transaksi tidak dapat dihapus. Status akan berubah menjadi <strong>VOID</strong>, saldo akan otomatis dikoreksi, dan tindakan ini dicatat di audit log.
                    </div>

                    {selectedTx && (
                        <div className="p-3 rounded-lg bg-[#F3F8FC] border border-[#D7E0E8] text-xs text-[#465362] space-y-1">
                            <div><strong>Kategori:</strong> {selectedTx.category?.name}</div>
                            <div><strong>Nominal:</strong> {formatRupiah(selectedTx.amount)}</div>
                            <div><strong>Keterangan:</strong> {selectedTx.description}</div>
                        </div>
                    )}

                    <Input
                        id="void_reason"
                        label="Alasan Void (Wajib)"
                        placeholder="Contoh: Salah memasukkan nominal iuran, dibuat transaksi baru pengganti"
                        value={voidData.void_reason}
                        onChange={(e) => setVoidData('void_reason', e.target.value)}
                        error={voidErrors.void_reason}
                        required
                        autoFocus
                    />

                    <div className="pt-4 border-t border-[#D7E0E8] flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => setVoidModal(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            loading={voidProcessing}
                            disabled={!voidData.void_reason}
                        >
                            Konfirmasi Void
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
