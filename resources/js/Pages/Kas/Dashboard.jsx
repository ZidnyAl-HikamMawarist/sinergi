import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    AlertCircle
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
            {/* Saldo Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Saldo Kas Aktif (Dihitung Server)
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                        {formatRupiah(stats.balance)}
                    </h2>
                    <p className="text-xs text-blue-100/80 mt-2">
                        Perhitungan server-side murni dari seluruh transaksi valid pada tahun ajaran ini.
                    </p>
                </div>

                <div className="flex sm:flex-col gap-3 shrink-0">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                        <span className="text-[11px] text-emerald-300 font-semibold block">Total Pemasukan</span>
                        <span className="text-sm font-bold text-white">+{formatRupiah(stats.totalIn)}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
                        <span className="text-[11px] text-rose-300 font-semibold block">Total Pengeluaran</span>
                        <span className="text-sm font-bold text-white">-{formatRupiah(stats.totalOut)}</span>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                    color="accent"
                />
            </div>

            {/* Transaction Ledger Table */}
            <Card
                title="Buku Besar Transaksi"
                subtitle="Daftar mutasi keuangan terbaru berurutan tanggal"
                accentColor="primary"
            >
                {transactions.data.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                        Belum ada mutasi kas pada periode ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider text-[11px]">
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
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.map((tx) => {
                                    const isVoid = tx.status === 'void';
                                    return (
                                        <tr
                                            key={tx.id}
                                            className={`transition-colors hover:bg-slate-50/80 ${
                                                isVoid ? 'bg-slate-50/60 opacity-60' : ''
                                            }`}
                                        >
                                            <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                                                {tx.transaction_date}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className={`font-bold text-slate-900 ${isVoid ? 'line-through' : ''}`}>
                                                    {tx.category?.name}
                                                </div>
                                                <div className="text-slate-500 text-[11px] mt-0.5 max-w-xs truncate">
                                                    {tx.description}
                                                </div>
                                                {isVoid && tx.void_reason && (
                                                    <div className="text-rose-600 text-[10px] mt-0.5 font-medium">
                                                        Alasan void: {tx.void_reason} (oleh {tx.voider?.name})
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {tx.type === 'masuk' ? (
                                                    <span className="inline-flex items-center text-emerald-700 font-bold">
                                                        <ArrowDownCircle className="w-4 h-4 mr-1 text-emerald-500" />
                                                        Masuk
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-rose-700 font-bold">
                                                        <ArrowUpCircle className="w-4 h-4 mr-1 text-rose-500" />
                                                        Keluar
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`px-5 py-3.5 font-extrabold whitespace-nowrap ${isVoid ? 'line-through text-slate-400' : tx.type === 'masuk' ? 'text-emerald-700' : 'text-slate-900'}`}>
                                                {tx.type === 'masuk' ? '+' : '-'}{formatRupiah(tx.amount)}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {tx.proof_path ? (
                                                    <a
                                                        href={`/storage/${tx.proof_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        Lihat Bukti
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
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
                                                        className="inline-flex items-center text-rose-600 hover:text-rose-800 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        <Ban className="w-3.5 h-3.5 mr-1" />
                                                        Void
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">Dibatalkan</span>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Jenis Transaksi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCreateData('type', 'masuk')}
                                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                    createData.type === 'masuk'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <ArrowDownCircle className="w-4 h-4 mr-1.5" />
                                Pemasukan (Masuk)
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateData('type', 'keluar')}
                                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                    createData.type === 'keluar'
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                                Pengeluaran (Keluar)
                            </button>
                        </div>
                    </div>

                    {/* Kategori Dropdown */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Kategori Kas <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={createData.cash_category_id}
                            onChange={(e) => setCreateData('cash_category_id', e.target.value)}
                            required
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {createErrors.cash_category_id && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Unggah Bukti Transaksi <span className="text-rose-500">* (Wajib)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            required
                            onChange={(e) => setCreateData('proof', e.target.files[0])}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">
                            Format JPG, PNG, atau PDF. Maksimal 5 MB. Bukti akan disimpan aman di private storage.
                        </p>
                        {createErrors.proof && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{createErrors.proof}</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <div className="flex items-center space-x-2 font-bold mb-1">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Perhatian: Transaksi Kas Bersifat Immutable</span>
                        </div>
                        Transaksi tidak dapat dihapus. Status akan berubah menjadi <strong>VOID</strong>, saldo akan otomatis dikoreksi, dan tindakan ini dicatat di audit log.
                    </div>

                    {selectedTx && (
                        <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
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

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
