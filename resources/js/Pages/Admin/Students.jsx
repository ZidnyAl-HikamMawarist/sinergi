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
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs">
                        <FileSpreadsheet className="w-4 h-4 mr-1 text-[#2A9D6F]" />
                        Import Siswa (CSV)
                    </Button>
                </Link>
            }
        >
            <Head title="Siswa & Kelas — SINERGI" />

            {/* Class Quick Selection Pills */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536170]">
                        Filter Rombongan Belajar / Kelas
                    </span>
                    {selectedClassId && (
                        <button
                            type="button"
                            onClick={() => handleClassSelect(null)}
                            className="text-xs text-[#1769AA] hover:text-[#0F4F82] font-bold"
                        >
                            Reset Filter Kelas
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => handleClassSelect(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !selectedClassId
                                ? 'bg-[#1769AA] text-white shadow-xs'
                                : 'bg-white border border-[#D9E2EA] text-[#536170] hover:bg-[#E8F4FB] hover:text-[#1769AA]'
                        }`}
                    >
                        Semua Kelas
                    </button>
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            type="button"
                            onClick={() => handleClassSelect(cls.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedClassId === cls.id
                                    ? 'bg-[#1769AA] text-white shadow-xs'
                                    : 'bg-white border border-[#D9E2EA] text-[#536170] hover:bg-[#E8F4FB] hover:text-[#1769AA]'
                            }`}
                        >
                            <span>{cls.name}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    selectedClassId === cls.id
                                        ? 'bg-[#0F4F82] text-white'
                                        : 'bg-[#E8F4FB] text-[#1769AA]'
                                }`}
                            >
                                {cls.enrollments_count ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Filter Form */}
            <Card className="mb-6" accentColor="blue">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-[#536170]" />
                        <input
                            type="text"
                            placeholder="Cari nama, NISN, atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9E2EA] rounded-lg focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none text-[#17202A] bg-white"
                        />
                    </div>

                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-xs border border-[#D9E2EA] rounded-lg px-3 py-2 focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none bg-white text-[#17202A]"
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
                <div className="p-4 sm:p-5 border-b border-[#D9E2EA] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-[#17202A]">
                            Direktori Siswa ({students.total ?? students.data.length})
                        </h3>
                        <p className="text-xs text-[#536170]">
                            Siswa terdaftar dalam database akademik
                        </p>
                    </div>
                </div>

                {students.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-[#536170] mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-[#17202A]">Tidak Ada Siswa Ditemukan</h4>
                        <p className="text-xs text-[#536170] mt-1 max-w-sm mx-auto">
                            Coba sesuaikan kata kunci pencarian atau filter kelas yang Anda pilih.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#D9E2EA] text-[#536170] font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">NISN</th>
                                    <th className="py-3 px-4">Kelas</th>
                                    <th className="py-3 px-4">Eskul Aktif</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D9E2EA]">
                                {students.data.map((student) => {
                                    const activeClass = student.enrollments?.[0]?.school_class?.name || '-';
                                    const eskuls = student.extracurricular_memberships || [];

                                    return (
                                        <tr key={student.id} className="hover:bg-[#F5F7FA] transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#123B5D] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#17202A] leading-tight">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[11px] text-[#536170] font-mono">
                                                            {student.email || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#536170] text-xs">
                                                {student.nisn || '-'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-[#17202A]">
                                                    {activeClass}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {eskuls.length > 0 ? (
                                                        eskuls.map((em) => (
                                                            <Badge key={em.id} variant="primary">
                                                                {em.extracurricular?.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[#536170] text-xs italic">
                                                            Belum ada eskul
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <Badge status={student.status}>
                                                    {student.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="p-1.5 text-[#1769AA] hover:bg-[#E8F4FB] rounded-md transition-colors"
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
                    <div className="p-4 border-t border-[#D9E2EA] flex items-center justify-between">
                        <div className="text-xs text-[#536170]">
                            Menampilkan {students.from ?? 0} - {students.to ?? 0} dari {students.total ?? 0} siswa
                        </div>
                        <div className="flex items-center space-x-1">
                            {students.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                        link.active
                                            ? 'bg-[#1769AA] text-white font-bold shadow-xs'
                                            : !link.url
                                            ? 'text-[#536170]/40 cursor-not-allowed'
                                            : 'text-[#536170] hover:bg-[#E8F4FB] hover:text-[#1769AA]'
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
                        <div className="flex items-center space-x-4 p-4 rounded-xl bg-[#E8F4FB] border border-[#1769AA]/20">
                            <div className="w-12 h-12 rounded-xl bg-[#123B5D] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                                {selectedStudent.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-[#17202A]">{selectedStudent.name}</h4>
                                <p className="text-xs text-[#536170] font-mono">NISN: {selectedStudent.nisn || '-'}</p>
                                <p className="text-xs text-[#536170]">Email: {selectedStudent.email || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#D9E2EA]">
                                <span className="text-[#536170] font-bold block mb-1 uppercase tracking-wider text-[10px]">
                                    Kelas Saat Ini
                                </span>
                                <span className="font-bold text-[#17202A] text-sm">
                                    {selectedStudent.enrollments?.[0]?.school_class?.name || 'Belum Terdaftar'}
                                </span>
                            </div>

                            <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#D9E2EA]">
                                <span className="text-[#536170] font-bold block mb-1 uppercase tracking-wider text-[10px]">
                                    Status Akun
                                </span>
                                <Badge status={selectedStudent.status}>
                                    {selectedStudent.status}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-[#536170] uppercase tracking-wider block mb-2">
                                Ekstrakurikuler yang Diikuti
                            </span>
                            {selectedStudent.extracurricular_memberships?.length > 0 ? (
                                <div className="space-y-1.5">
                                    {selectedStudent.extracurricular_memberships.map((em) => (
                                        <div
                                            key={em.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-[#D9E2EA] bg-white text-xs"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="w-4 h-4 text-[#1769AA]" />
                                                <span className="font-bold text-[#17202A]">
                                                    {em.extracurricular?.name}
                                                </span>
                                            </div>
                                            <Badge variant={em.position === 'Ketua' ? 'warning' : 'primary'}>
                                                {em.position || 'Anggota'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#536170] italic p-3 bg-[#F5F7FA] rounded-lg border border-[#D9E2EA] text-center">
                                    Siswa belum terdaftar pada ekstrakurikuler manapun tahun ini.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="outline"
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
