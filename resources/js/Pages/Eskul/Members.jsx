import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import { formatIndonesianDate } from '@/Utils/format';
import {
    Users,
    UserPlus,
    ShieldCheck,
    Search,
    UserMinus,
    Crown,
    GraduationCap,
    Calendar,
    Building2,
    CheckCircle2
} from 'lucide-react';

export default function Members({
    myEskuls = [],
    selectedEskul,
    selectedEskulId,
    members = [],
    availableStudents = [],
}) {
    const [search, setSearch] = useState('');
    const [addModal, setAddModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const {
        data: addData,
        setData: setAddData,
        post: postAdd,
        processing: addProcessing,
        errors: addErrors,
        reset: resetAdd,
    } = useForm({
        extracurricular_id: selectedEskul?.id || '',
        user_id: '',
        position: 'anggota',
    });

    const handleEskulChange = (e) => {
        router.get('/eskul/members', { eskul_id: e.target.value }, { preserveState: true });
    };

    const handleOpenAdd = () => {
        setAddData('extracurricular_id', selectedEskul?.id || '');
        setAddData('user_id', availableStudents[0]?.id || '');
        setAddData('position', 'anggota');
        setAddModal(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd('/eskul/members', {
            onSuccess: () => {
                setAddModal(false);
                resetAdd();
            },
        });
    };

    const handleOpenDelete = (member) => {
        setSelectedMember(member);
        setDeleteModal(true);
    };

    const handleDeleteSubmit = () => {
        if (!selectedMember) return;
        router.delete(`/eskul/members/${selectedMember.id}`, {
            onSuccess: () => {
                setDeleteModal(false);
                setSelectedMember(null);
            },
        });
    };

    const filteredMembers = members.filter((m) => {
        const query = search.toLowerCase();
        const name = (m.user?.name || '').toLowerCase();
        const nisn = (m.user?.nisn || '').toLowerCase();
        const className = (m.user?.enrollments?.[0]?.school_class?.name || '').toLowerCase();
        return name.includes(query) || nisn.includes(query) || className.includes(query);
    });

    const ketuaCount = members.filter((m) => m.position === 'ketua').length;
    const wakilCount = members.filter((m) => m.position === 'wakil').length;
    const anggotaCount = members.filter((m) => m.position === 'anggota').length;

    const getPositionBadge = (pos) => {
        switch (pos) {
            case 'ketua':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFF4D6] text-[#B7791F] border border-[#F4B942]/40">
                        <Crown className="w-3.5 h-3.5 text-[#B7791F]" />
                        Ketua
                    </span>
                );
            case 'wakil':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#E8F4FB] text-[#123B5D] border border-[#1769AA]/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1769AA]" />
                        Wakil Ketua
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F5F7FA] text-[#536170] border border-[#D9E2EA]">
                        Anggota
                    </span>
                );
        }
    };

    return (
        <AppLayout
            title="Daftar Anggota Eskul"
            header="Manajemen Anggota & Kepengurusan"
            subtitle="Kelola struktur organisasi, penetapan jabatan, dan data keanggotaan aktif ekstrakurikuler."
            actions={
                selectedEskul && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2"
                        disabled={availableStudents.length === 0}
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Anggota Baru
                    </Button>
                )
            }
        >
            <Head title="Anggota Eskul — SINERGI" />

            {/* Eskul Selector Filter Bar */}
            <Card className="mb-6 border-[#D9E2EA] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-[#123B5D] text-white rounded-lg shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#123B5D]">
                                Ekstrakurikuler Dikelola
                            </span>
                            <h3 className="text-base font-bold text-[#17202A]">
                                {selectedEskul ? selectedEskul.name : 'Pilih Ekstrakurikuler'}
                            </h3>
                        </div>
                    </div>

                    {myEskuls.length > 1 && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-bold text-[#536170] whitespace-nowrap">
                                Ganti Eskul:
                            </label>
                            <select
                                value={selectedEskulId || ''}
                                onChange={handleEskulChange}
                                className="text-xs font-semibold rounded-lg border border-[#D9E2EA] bg-white focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] py-1.5 px-3 text-[#17202A]"
                            >
                                {myEskuls.map((eskul) => (
                                    <option key={eskul.id} value={eskul.id}>
                                        {eskul.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            {/* Structure Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Anggota Aktif"
                    value={members.length}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Ketua Terpilih"
                    value={ketuaCount}
                    icon={Crown}
                    color="yellow"
                />
                <StatCard
                    title="Wakil Ketua"
                    value={wakilCount}
                    icon={ShieldCheck}
                    color="sky"
                />
                <StatCard
                    title="Anggota Terdaftar"
                    value={anggotaCount}
                    icon={GraduationCap}
                    color="green"
                />
            </div>

            {/* Member Roster Card */}
            <Card
                title={`Buku Induk Anggota — ${selectedEskul ? selectedEskul.name : ''}`}
                subtitle="Data administratif keanggotaan resmi yang berhak mengikuti kegiatan dan presensi QR"
                accentColor="blue"
                actions={
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-[#536170] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama, NISN, atau kelas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#D9E2EA] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] bg-white text-[#17202A]"
                        />
                    </div>
                }
            >
                {filteredMembers.length === 0 ? (
                    <div className="text-center py-12 text-[#536170] text-sm">
                        {search ? 'Tidak ada anggota yang cocok dengan pencarian.' : 'Belum ada anggota di ekstrakurikuler ini.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left text-xs text-[#536170]">
                            <thead className="bg-[#F5F7FA] text-[#536170] font-bold border-y border-[#D9E2EA] uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-5 py-3 w-12 text-center">No</th>
                                    <th className="px-5 py-3">Nama Anggota & Email</th>
                                    <th className="px-5 py-3">NISN</th>
                                    <th className="px-5 py-3">Kelas</th>
                                    <th className="px-5 py-3">Jabatan</th>
                                    <th className="px-5 py-3">Tanggal Gabung</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D9E2EA]">
                                {filteredMembers.map((member, index) => {
                                    const className = member.user?.enrollments?.[0]?.school_class?.name || '-';
                                    return (
                                        <tr key={member.id} className="hover:bg-[#F5F7FA] transition-colors">
                                            <td className="px-5 py-3.5 text-center font-medium text-[#536170]">
                                                {index + 1}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-[#17202A] flex items-center gap-1.5">
                                                    {member.user?.name}
                                                </div>
                                                <div className="text-[#536170] text-[11px]">
                                                    {member.user?.email || '-'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-[#536170]">
                                                {member.user?.nisn || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-[#1769AA]">
                                                {className}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {getPositionBadge(member.position)}
                                            </td>
                                            <td className="px-5 py-3.5 text-[#536170] whitespace-nowrap">
                                                {member.joined_at ? formatIndonesianDate(member.joined_at) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(member)}
                                                    className="inline-flex items-center text-xs font-semibold text-[#E76F51] hover:text-[#d35b3e] hover:bg-[#FCE8E3] px-2 py-1 rounded-md transition-colors"
                                                    title="Nonaktifkan anggota"
                                                >
                                                    <UserMinus className="w-3.5 h-3.5 mr-1" />
                                                    Keluarkan
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal Tambah Anggota */}
            <Modal
                show={addModal}
                onClose={() => setAddModal(false)}
                title={`Tambah Anggota — ${selectedEskul?.name || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#536170] uppercase tracking-wider mb-1">
                            Pilih Siswa
                        </label>
                        <select
                            value={addData.user_id}
                            onChange={(e) => setAddData('user_id', e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#D9E2EA] focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] py-2 px-3 text-[#17202A] bg-white"
                            required
                        >
                            <option value="">-- Pilih Siswa Sekolah --</option>
                            {availableStudents.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.nisn}) — {s.enrollments?.[0]?.school_class?.name || 'Tanpa Kelas'}
                                </option>
                            ))}
                        </select>
                        {addErrors.user_id && (
                            <p className="text-xs text-[#E76F51] mt-1">{addErrors.user_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#536170] uppercase tracking-wider mb-1">
                            Jabatan Organisasi
                        </label>
                        <select
                            value={addData.position}
                            onChange={(e) => setAddData('position', e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#D9E2EA] focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] py-2 px-3 text-[#17202A] bg-white"
                            required
                        >
                            <option value="anggota">Anggota Biasa</option>
                            <option value="wakil">Wakil Ketua</option>
                            <option value="ketua">Ketua Ekstrakurikuler</option>
                        </select>
                        {addErrors.position && (
                            <p className="text-xs text-[#E76F51] mt-1">{addErrors.position}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#D9E2EA]">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setAddModal(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={addProcessing}
                        >
                            Simpan Anggota
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Anggota */}
            <Modal
                show={deleteModal}
                onClose={() => setDeleteModal(false)}
                title="Konfirmasi Nonaktifkan Anggota"
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[#536170]">
                        Apakah Anda yakin ingin menonaktifkan siswa{' '}
                        <strong className="text-[#17202A]">{selectedMember?.user?.name}</strong> dari keanggotaan{' '}
                        <strong className="text-[#17202A]">{selectedEskul?.name}</strong>?
                    </p>
                    <p className="text-xs text-[#9A6B00] bg-[#FFF4D6] border border-[#F4B942] rounded-lg p-3">
                        Catatan: Riwayat presensi kehadiran yang telah lalu tetap tersimpan utuh demi integritas audit. Siswa tidak akan dapat dipindai lagi pada sesi mendatang.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setDeleteModal(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDeleteSubmit}
                        >
                            Ya, Keluarkan
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
