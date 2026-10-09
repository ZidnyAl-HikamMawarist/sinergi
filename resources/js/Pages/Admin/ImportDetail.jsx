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
                        <Button variant="secondary" size="sm">
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
                                variant={credentialsDownloaded ? 'secondary' : 'success'}
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
                    color="blue"
                />
                <StatCard
                    title="Siswa Baru"
                    value={batch.new_rows || 0}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Pembaruan Data"
                    value={batch.updated_rows || 0}
                    icon={CheckCircle2}
                    color="blue"
                />
                <StatCard
                    title="Baris Bermasalah"
                    value={batch.error_rows || 0}
                    icon={AlertCircle}
                    color="coral"
                />
            </div>

            {/* Credentials One-Time Notice */}
            {isCommitted && !credentialsDownloaded && (
                <div className="mb-6 p-4 rounded-xl bg-[#FFF4D6] border border-[#F4B942] text-[#9A6B00] text-xs flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <ShieldAlert className="w-5 h-5 text-[#F4B942] shrink-0" />
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
                accentColor="blue"
            >
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-left text-xs text-[#536170]">
                        <thead className="bg-[#F5F7FA] text-[#536170] font-bold border-y border-[#D9E2EA] uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3">Baris</th>
                                <th className="px-5 py-3">NISN</th>
                                <th className="px-5 py-3">Nama Siswa</th>
                                <th className="px-5 py-3">Kelas</th>
                                <th className="px-5 py-3">Aksi Sistem</th>
                                <th className="px-5 py-3">Keterangan / Error</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D9E2EA]">
                            {rows.data.map((row) => {
                                const isErr = row.action === 'error';
                                const isNew = row.action === 'new';

                                return (
                                    <tr
                                        key={row.id}
                                        className={`transition-colors hover:bg-[#F5F7FA] ${
                                            isErr ? 'bg-[#FCE8E3]' : ''
                                        }`}
                                    >
                                        <td className="px-5 py-3 font-mono text-[#536170]">
                                            #{row.row_number}
                                        </td>
                                        <td className="px-5 py-3 font-mono font-bold text-[#17202A]">
                                            {row.payload?.nisn || '-'}
                                        </td>
                                        <td className="px-5 py-3 font-bold text-[#17202A]">
                                            {row.payload?.name || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-[#536170]">
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
                                        <td className="px-5 py-3 text-[#536170]">
                                            {row.error_message ? (
                                                <span className="text-[#E76F51] font-semibold">
                                                    {row.error_message}
                                                </span>
                                            ) : (
                                                <span className="text-[#2A9D6F] font-semibold">
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
