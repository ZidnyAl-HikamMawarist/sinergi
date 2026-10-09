import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    FileSpreadsheet,
    UploadCloud,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    ArrowRight
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { formatIndonesianDate } from '@/Utils/format';

export default function Import({ batches = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const handleFileSubmit = (e) => {
        e.preventDefault();
        post('/admin/import/preview', {
            onSuccess: () => reset(),
        });
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,nisn,nama,kelas,email\n0051234570,Rizky Pratama,X PPLG 1,rizky@example.com\n0051234571,Nabila Putri,X PPLG 2,nabila@example.com\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_siswa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout
            title="Import Data Siswa"
            header="Import Data Siswa (CSV)"
            subtitle="Unggah berkas data siswa dari Dapodik/data sekolah. Sistem akan melakukan validasi dan pratinjau sebelum menyimpan."
            actions={
                <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-1.5 text-[#1769AA]" />
                    Unduh Template CSV
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Upload Form */}
                <div className="lg:col-span-5">
                    <Card title="Unggah Berkas CSV Siswa" accentColor="blue">
                        <form onSubmit={handleFileSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-[#D9E2EA] hover:border-[#1769AA] rounded-xl p-6 text-center transition-colors bg-[#F5F7FA]">
                                <UploadCloud className="w-10 h-10 text-[#1769AA] mx-auto mb-3" />
                                <label className="block text-xs font-bold text-[#17202A] cursor-pointer">
                                    <span>Pilih berkas CSV dari komputer</span>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        required
                                        onChange={(e) => setData('file', e.target.files[0])}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-[11px] text-[#536170] mt-1">
                                    {data.file ? data.file.name : 'Format .csv (maksimal 10 MB)'}
                                </p>
                            </div>

                            {errors.file && (
                                <p className="text-xs text-[#E76F51] font-semibold">{errors.file}</p>
                            )}

                            <div className="bg-[#F5F7FA] border border-[#D9E2EA] p-3.5 rounded-lg text-[11px] text-[#536170] space-y-1">
                                <div className="font-bold text-[#17202A] mb-1">Ketentuan Berkas:</div>
                                <div>&bull; Kolom wajib: <code className="text-[#1769AA] font-bold">nisn</code>, <code className="text-[#1769AA] font-bold">nama</code></div>
                                <div>&bull; Kolom opsional: <code className="text-[#1769AA] font-bold">kelas</code>, <code className="text-[#1769AA] font-bold">email</code></div>
                                <div>&bull; Jika NISN sudah ada, sistem akan memperbarui data tanpa membuat duplikat.</div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                className="w-full"
                                loading={processing}
                                disabled={!data.file}
                            >
                                Lanjutkan ke Pratinjau
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Previous Batches List */}
                <div className="lg:col-span-7">
                    <Card
                        title="Riwayat Batch Import"
                        subtitle="Daftar batch berkas yang pernah diproses"
                        accentColor="blue"
                    >
                        {batches.length === 0 ? (
                            <div className="text-center py-10 text-[#536170] text-xs">
                                Belum ada riwayat import data siswa.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D9E2EA]">
                                {batches.map((batch) => (
                                    <div key={batch.id} className="py-3.5 flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={`/admin/import/${batch.uuid}`}
                                                className="text-sm font-bold text-[#17202A] hover:text-[#1769AA] flex items-center gap-1.5"
                                            >
                                                {batch.filename}
                                                <ArrowRight className="w-3.5 h-3.5 text-[#536170]" />
                                            </Link>
                                            <div className="text-xs text-[#536170] mt-0.5">
                                                {batch.total_rows} total baris &bull;{' '}
                                                <span className="text-[#2A9D6F] font-semibold">+{batch.new_rows} baru</span> &bull;{' '}
                                                <span className="text-[#1769AA] font-semibold">~{batch.updated_rows} update</span> &bull;{' '}
                                                <span className="text-[#E76F51] font-semibold">!{batch.error_rows} error</span>
                                            </div>
                                            <div className="text-[10px] text-[#536170] mt-0.5">
                                                Diupload oleh {batch.uploader?.name} &bull; {formatIndonesianDate(batch.created_at)}
                                            </div>
                                        </div>

                                        <div>
                                            <Badge status={batch.status === 'committed' ? 'valid' : batch.status === 'failed' ? 'alpa' : 'draft'}>
                                                {batch.status}
                                            </Badge>
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
