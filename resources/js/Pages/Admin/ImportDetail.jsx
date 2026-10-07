import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Download,
    Save,
    FileSpreadsheet,
    ShieldAlert
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';

export default function ImportDetail({ batch = {}, rows = { data: [] } }) {
    const isPreview = batch.status === 'preview';
    const isCommitted = batch.status === 'committed';
    const hasCredentials = Boolean(batch.credentials_path);
    const credentialsDownloaded = Boolean(batch.credentials_downloaded_at);

    const handleCommit = () => {
        if (confirm(`Apakah Anda yakin ingin memproses ${batch.new_rows + batch.updated_rows} data siswa ke dalam sistem?`)) {
            router.post(`/admin/import/${batch.uuid}/commit`);
        }
    };

    return (
        <AppLayout
            title={`Batch Import: ${batch.filename}`}
            header={`Detail Import: ${batch.filename}`}
            subtitle={`Status: ${batch.status.toUpperCase()} &bull; Total ${batch.total_rows} baris data`}
            actions={
                <div className="flex gap-2">
                    <Link href="/admin/import">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Kembali
                        </Button>
                    </Link>

                    {isPreview && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleCommit}
                            disabled={batch.new_rows === 0 && batch.updated_rows === 0}
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            Simpan ke Database
                        </Button>
                    )}

                    {isCommitted && hasCredentials && (
                        <a
                            href={`/admin/import/${batch.uuid}/credentials`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button
                                variant={credentialsDownloaded ? 'outline' : 'success'}
                                size="sm"
                                disabled={credentialsDownloaded}
                            >
                                <Download className="w-4 h-4 mr-1.5" />
                                {credentialsDownloaded ? 'Kredensial Sudah Diunduh' : 'Unduh Kredensial Awal (1x)'}
                            </Button>
                        </a>
                    )}
                </div>
            }
        >
            {/* Metric Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Baris"
                    value={batch.total_rows || 0}
                    icon={FileSpreadsheet}
                    color="primary"
                />
                <StatCard
                    title="Siswa Baru"
                    value={batch.new_rows || 0}
                    icon={CheckCircle2}
                    color="success"
                />
                <StatCard
                    title="Pembaruan Data"
                    value={batch.updated_rows || 0}
                    icon={CheckCircle2}
                    color="primary"
                />
                <StatCard
                    title="Baris Bermasalah"
                    value={batch.error_rows || 0}
                    icon={AlertCircle}
                    color="danger"
                />
            </div>

            {/* Credentials One-Time Notice */}
            {isCommitted && !credentialsDownloaded && (
                <div className="mb-6 p-4 rounded-lg bg-[#FEF8EC] border border-[#B7791F]/30 text-[#B7791F] text-xs flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5 text-[#B7791F] shrink-0" />
                        <span>
                            <strong>Penting:</strong> Daftar kata sandi awal siswa yang baru dibuat hanya dapat diunduh <strong>SATU KALI</strong> demi privasi data. Pastikan Anda mengunduh dan menyimpannya di tempat yang aman.
                        </span>
                    </div>
                </div>
            )}

            {/* Rows Table */}
            <Card
                title="Rincian Baris Data"
                subtitle="Status validasi per baris sebelum dimasukkan ke database"
                accentColor="primary"
            >
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-left text-xs text-[#46515C]">
                        <thead className="bg-[#F7F5F0] text-[#46515C] font-semibold border-y border-[#D9DEE3] uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3">Baris</th>
                                <th className="px-5 py-3">NISN</th>
                                <th className="px-5 py-3">Nama Siswa</th>
                                <th className="px-5 py-3">Kelas</th>
                                <th className="px-5 py-3">Aksi Sistem</th>
                                <th className="px-5 py-3">Keterangan / Error</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D9DEE3]">
                            {rows.data.map((row) => {
                                const isErr = row.action === 'error';
                                const isNew = row.action === 'new';

                                return (
                                    <tr
                                        key={row.id}
                                        className={`transition-colors hover:bg-[#F7F5F0]/60 ${
                                            isErr ? 'bg-[#FDF2F2]' : ''
                                        }`}
                                    >
                                        <td className="px-5 py-3 font-mono text-[#737D86]">
                                            #{row.row_number}
                                        </td>
                                        <td className="px-5 py-3 font-mono font-bold text-[#17212B]">
                                            {row.payload?.nisn || '-'}
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-[#17212B]">
                                            {row.payload?.name || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-[#46515C]">
                                            {row.payload?.class || '-'}
                                        </td>
                                        <td className="px-5 py-3">
                                            {isErr ? (
                                                <Badge status="alpa">Error</Badge>
                                            ) : isNew ? (
                                                <Badge status="hadir">Baru</Badge>
                                            ) : (
                                                <Badge status="sakit">Update</Badge>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-[#737D86]">
                                            {row.error_message ? (
                                                <span className="text-[#C24141] font-medium">
                                                    {row.error_message}
                                                </span>
                                            ) : (
                                                <span className="text-[#287D5A] font-medium">
                                                    Siap diproses
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
