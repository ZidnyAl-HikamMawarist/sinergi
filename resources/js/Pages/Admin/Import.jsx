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
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-1.5 text-blue-600" />
                    Unduh Template CSV
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Upload Form */}
                <div className="lg:col-span-5">
                    <Card title="Unggah Berkas CSV Siswa" accentColor="primary">
                        <form onSubmit={handleFileSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-[#D9DEE3] hover:border-[#1F4E79] rounded-lg p-6 text-center transition-colors bg-[#F7F5F0]">
                                <UploadCloud className="w-10 h-10 text-[#1F4E79] mx-auto mb-3" />
                                <label className="block text-xs font-semibold text-[#17212B] cursor-pointer">
                                    <span>Pilih berkas CSV dari komputer</span>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        required
                                        onChange={(e) => setData('file', e.target.files[0])}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-[11px] text-[#737D86] mt-1">
                                    {data.file ? data.file.name : 'Format .csv (maksimal 10 MB)'}
                                </p>
                            </div>

                            {errors.file && (
                                <p className="text-xs text-[#C24141] font-medium">{errors.file}</p>
                            )}

                            <div className="bg-[#F7F5F0] border border-[#D9DEE3] p-3.5 rounded-lg text-[11px] text-[#46515C] space-y-1">
                                <div className="font-semibold text-[#17212B] mb-1">Ketentuan Berkas:</div>
                                <div>&bull; Kolom wajib: <code>nisn</code>, <code>nama</code></div>
                                <div>&bull; Kolom opsional: <code>kelas</code>, <code>email</code></div>
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
                        accentColor="primary"
                    >
                        {batches.length === 0 ? (
                            <div className="text-center py-10 text-[#737D86] text-xs">
                                Belum ada riwayat import data siswa.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#D9DEE3]">
                                {batches.map((batch) => (
                                    <div key={batch.id} className="py-3.5 flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={`/admin/import/${batch.uuid}`}
                                                className="text-sm font-semibold text-[#17212B] hover:text-[#1F4E79] flex items-center gap-1.5"
                                            >
                                                {batch.filename}
                                                <ArrowRight className="w-3.5 h-3.5 text-[#737D86]" />
                                            </Link>
                                            <div className="text-xs text-[#737D86] mt-0.5">
                                                {batch.total_rows} total baris &bull;{' '}
                                                <span className="text-[#287D5A]">+{batch.new_rows} baru</span> &bull;{' '}
                                                <span className="text-[#1F4E79]">~{batch.updated_rows} update</span> &bull;{' '}
                                                <span className="text-[#C24141]">!{batch.error_rows} error</span>
                                            </div>
                                            <div className="text-[10px] text-[#737D86] mt-0.5">
                                                Diupload oleh {batch.uploader?.name} &bull; {new Date(batch.created_at).toLocaleDateString('id-ID')}
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
