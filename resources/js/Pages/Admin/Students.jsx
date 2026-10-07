import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import {
    Users,
    Search,
    GraduationCap,
    Building2,
    Calendar,
    Filter,
    Eye,
    FileSpreadsheet,
    Mail,
    Phone,
    Shield
} from 'lucide-react';

export default function Students({
    classes = [],
    selectedClassId,
    filters = { search: '', status: '' },
    students = { data: [], links: [] },
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            '/admin/students',
            {
                class_id: selectedClassId || undefined,
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    const handleClassSelect = (classId) => {
        router.get(
            '/admin/students',
            {
                class_id: classId === selectedClassId ? undefined : classId,
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout
            title="Daftar Siswa & Kelas"
            header="Siswa & Kelas"
            subtitle="Direktori profil siswa, penempatan rombongan belajar, dan eskul aktif"
            actions={
                <Link href="/admin/import">
                    <Button variant="secondary" className="flex items-center gap-1.5 text-xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        Import Siswa (CSV)
                    </Button>
                </Link>
            }
        >
            <Head title="Siswa & Kelas — SINERGI" />

            {/* Class Quick Selection Pills */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#737D86]">
                        Filter Rombongan Belajar / Kelas
                    </span>
                    {selectedClassId && (
                        <button
                            type="button"
                            onClick={() => handleClassSelect(null)}
                            className="text-xs text-[#1F4E79] hover:underline font-semibold"
                        >
                            Reset Filter Kelas
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => handleClassSelect(null)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            !selectedClassId
                                ? 'bg-[#1F4E79] text-white shadow-xs'
                                : 'bg-white border border-[#D9DEE3] text-[#46515C] hover:bg-[#F7F5F0]'
                        }`}
                    >
                        Semua Kelas
                    </button>
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            type="button"
                            onClick={() => handleClassSelect(cls.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                selectedClassId === cls.id
                                    ? 'bg-[#1F4E79] text-white shadow-xs'
                                    : 'bg-white border border-[#D9DEE3] text-[#46515C] hover:bg-[#F7F5F0]'
                            }`}
                        >
                            <span>{cls.name}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    selectedClassId === cls.id
                                        ? 'bg-[#173A5C] text-white'
                                        : 'bg-[#F7F5F0] text-[#737D86]'
                                }`}
                            >
                                {cls.enrollments_count ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Filter Form */}
            <Card className="mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-[#737D86]" />
                        <input
                            type="text"
                            placeholder="Cari nama, NISN, atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9DEE3] rounded-md focus:border-[#1F4E79] focus:outline-none text-[#17212B] bg-white"
                        />
                    </div>

                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-xs border border-[#D9DEE3] rounded-md px-3 py-2 focus:border-[#1F4E79] focus:outline-none bg-white text-[#17212B]"
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>

                    <div>
                        <Button type="submit" variant="secondary" className="w-full text-xs flex items-center justify-center gap-1.5">
                            <Filter className="w-3.5 h-3.5" />
                            Terapkan Filter
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Students Table */}
            <Card padding={false} className="overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#D9DEE3] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-[#17212B]">
                            Direktori Siswa ({students.total ?? students.data.length})
                        </h3>
                        <p className="text-xs text-[#737D86]">
                            Siswa terdaftar dalam database akademik
                        </p>
                    </div>
                </div>

                {students.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-[#737D86] mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-[#17212B]">Tidak Ada Siswa Ditemukan</h4>
                        <p className="text-xs text-[#737D86] mt-1 max-w-sm mx-auto">
                            Coba sesuaikan kata kunci pencarian atau filter kelas yang Anda pilih.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-[#F7F5F0] border-b border-[#D9DEE3] text-[#46515C] font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">NISN</th>
                                    <th className="py-3 px-4">Kelas</th>
                                    <th className="py-3 px-4">Eskul Aktif</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D9DEE3]">
                                {students.data.map((student) => {
                                    const activeClass = student.enrollments?.[0]?.school_class?.name || '-';
                                    const eskuls = student.extracurricular_memberships || [];

                                    return (
                                        <tr key={student.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#1F4E79] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[#17212B] leading-tight">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[11px] text-[#737D86] font-mono">
                                                            {student.email || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#737D86] text-xs">
                                                {student.nisn || '-'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-[#17212B]">
                                                    {activeClass}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {eskuls.length > 0 ? (
                                                        eskuls.map((em) => (
                                                            <Badge key={em.id} variant="neutral">
                                                                {em.extracurricular?.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[#737D86] text-xs italic">
                                                            Belum ada eskul
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <Badge variant={student.status === 'aktif' ? 'success' : 'neutral'}>
                                                    {student.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="p-1.5 text-[#1F4E79] hover:bg-[#EAF2F8] rounded transition-colors"
                                                    title="Lihat Detail Profil"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {students.links && students.links.length > 3 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Menampilkan {students.from ?? 0} - {students.to ?? 0} dari {students.total ?? 0} siswa
                        </div>
                        <div className="flex items-center space-x-1">
                            {students.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-bold'
                                            : !link.url
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Student Detail Modal */}
            <Modal
                show={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                title="Detail Profil Siswa"
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 rounded-lg bg-[#EAF2F8] border border-[#1F4E79]/20">
                            <div className="w-12 h-12 rounded-lg bg-[#1F4E79] text-white font-bold text-lg flex items-center justify-center shrink-0">
                                {selectedStudent.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-[#17212B]">{selectedStudent.name}</h4>
                                <p className="text-xs text-[#46515C] font-mono">NISN: {selectedStudent.nisn || '-'}</p>
                                <p className="text-xs text-[#737D86]">Email: {selectedStudent.email || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#D9DEE3]">
                                <span className="text-[#737D86] font-semibold block mb-1 uppercase tracking-wider text-[10px]">
                                    Kelas Saat Ini
                                </span>
                                <span className="font-semibold text-[#17212B] text-sm">
                                    {selectedStudent.enrollments?.[0]?.school_class?.name || 'Belum Terdaftar'}
                                </span>
                            </div>

                            <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#D9DEE3]">
                                <span className="text-[#737D86] font-semibold block mb-1 uppercase tracking-wider text-[10px]">
                                    Status Akun
                                </span>
                                <Badge variant={selectedStudent.status === 'aktif' ? 'success' : 'neutral'}>
                                    {selectedStudent.status}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-semibold text-[#46515C] uppercase tracking-wider block mb-2">
                                Ekstrakurikuler yang Diikuti
                            </span>
                            {selectedStudent.extracurricular_memberships?.length > 0 ? (
                                <div className="space-y-1.5">
                                    {selectedStudent.extracurricular_memberships.map((em) => (
                                        <div
                                            key={em.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-[#D9DEE3] bg-white text-xs"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="w-4 h-4 text-[#1F4E79]" />
                                                <span className="font-semibold text-[#17212B]">
                                                    {em.extracurricular?.name}
                                                </span>
                                            </div>
                                            <Badge variant={em.position === 'Ketua' ? 'primary' : 'neutral'}>
                                                {em.position || 'Anggota'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#737D86] italic p-3 bg-[#F7F5F0] rounded-lg border border-[#D9DEE3] text-center">
                                    Siswa belum terdaftar pada ekstrakurikuler manapun tahun ini.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSelectedStudent(null)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
