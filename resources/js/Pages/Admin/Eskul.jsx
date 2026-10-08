import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Modal from '@/Components/Modal';
import {
    Building2,
    Users,
    Plus,
    Calendar,
    Search,
    UserPlus,
    UserMinus,
    CheckCircle,
    XCircle,
    SlidersHorizontal,
    Sparkles
} from 'lucide-react';

export default function Eskul({
    eskuls = [],
    selectedEskul,
    members = [],
    availableStudents = [],
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');

    const createForm = useForm({
        name: '',
        description: '',
    });

    const addMemberForm = useForm({
        user_id: '',
        position: 'Anggota',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/eskul', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleAddMemberSubmit = (e) => {
        e.preventDefault();
        if (!selectedEskul) return;
        addMemberForm.post(`/admin/eskul/${selectedEskul.uuid}/members`, {
            onSuccess: () => {
                setAddMemberModalOpen(false);
                addMemberForm.reset();
            },
        });
    };

    const handleRemoveMember = (memberId) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan status anggota ini dari eskul? (Histori presensi tetap tersimpan)')) {
            return;
        }
        router.delete(`/admin/eskul/${selectedEskul.uuid}/members/${memberId}`);
    };

    const handleSelectEskul = (uuid) => {
        router.get('/admin/eskul', { selected: uuid }, { preserveState: true });
    };

    const filteredStudents = availableStudents.filter((s) => {
        const query = searchStudent.toLowerCase();
        return (
            s.name.toLowerCase().includes(query) ||
            (s.nisn && s.nisn.toLowerCase().includes(query))
        );
    });

    return (
        <AppLayout
            title="Kelola Ekstrakurikuler"
            header="Ekstrakurikuler & Pembina"
            subtitle="Manajemen daftar eskul, penetapan pembina, dan keanggotaan siswa"
            actions={
                <Button
                    onClick={() => setCreateModalOpen(true)}
                    variant="primary"
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Eskul Baru
                </Button>
            }
        >
            <Head title="Ekstrakurikuler — SINERGI" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Eskuls */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#536170]">
                            Daftar Eskul ({eskuls.length})
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {eskuls.map((eskul) => {
                            const isSelected = selectedEskul?.id === eskul.id;
                            return (
                                <div
                                    key={eskul.id}
                                    onClick={() => handleSelectEskul(eskul.uuid)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#E8F4FB] border-[#1769AA] border-l-4 shadow-sm'
                                            : 'bg-white border-[#D9E2EA] hover:border-[#1769AA]/40 hover:bg-[#F5F7FA]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                    isSelected
                                                        ? 'bg-[#123B5D] text-white'
                                                        : 'bg-[#E8F4FB] text-[#1769AA]'
                                                }`}
                                            >
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-[#17202A]">{eskul.name}</h3>
                                                <p className="text-xs text-[#536170] line-clamp-1">
                                                    {eskul.description || 'Tidak ada deskripsi'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={eskul.status === 'aktif' ? 'success' : 'neutral'}>
                                            {eskul.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-[#D9E2EA] flex items-center justify-between text-xs text-[#536170]">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Users className="w-3.5 h-3.5 text-[#1769AA]" />
                                            {eskul.members_count ?? 0} Anggota
                                        </span>
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-[#2A9D6F]" />
                                            {eskul.activity_sessions_count ?? 0} Sesi
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Eskul Details & Members */}
                <div className="lg:col-span-2">
                    {selectedEskul ? (
                        <div className="space-y-6">
                            <Card className="border-l-4 border-l-[#1769AA] border-[#D9E2EA]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h2 className="text-xl font-bold text-[#17202A]">
                                                {selectedEskul.name}
                                            </h2>
                                            <Badge variant={selectedEskul.status === 'aktif' ? 'success' : 'neutral'}>
                                                {selectedEskul.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-[#536170]">
                                            {selectedEskul.description || 'Ekstrakurikuler resmi di lingkungan sekolah.'}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => setAddMemberModalOpen(true)}
                                        variant="primary"
                                        className="flex items-center gap-1.5 self-start sm:self-auto text-xs"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Tambah Anggota
                                    </Button>
                                </div>
                            </Card>

                            {/* Members Table */}
                            <Card padding={false} className="overflow-hidden border-[#D9E2EA]">
                                <div className="p-4 sm:p-5 border-b border-[#D9E2EA] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-[#17202A]">
                                            Daftar Anggota Aktif ({members.length})
                                        </h3>
                                        <p className="text-xs text-[#536170]">
                                            Tahun Ajaran aktif yang sedang berjalan
                                        </p>
                                    </div>
                                </div>

                                {members.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Users className="w-12 h-12 text-[#536170] mx-auto mb-3 opacity-60" />
                                        <h4 className="text-sm font-bold text-[#17202A]">Belum Ada Anggota</h4>
                                        <p className="text-xs text-[#536170] mt-1 max-w-sm mx-auto">
                                            Klik tombol "Tambah Anggota" di atas untuk mendaftarkan siswa ke dalam eskul ini.
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
                                                    <th className="py-3 px-4">Jabatan</th>
                                                    <th className="py-3 px-4">Bergabung</th>
                                                    <th className="py-3 px-4 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#D9E2EA]">
                                                {members.map((member) => (
                                                    <tr key={member.id} className="hover:bg-[#F5F7FA] transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-[#17202A]">
                                                            {member.user?.name}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono text-[#536170] text-xs">
                                                            {member.user?.nisn || '-'}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-[#536170]">
                                                            {member.user?.student_profile?.class_room?.name || '-'}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <Badge variant={member.position === 'Ketua' ? 'warning' : 'neutral'}>
                                                                {member.position || 'Anggota'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-[#536170] text-xs">
                                                            {member.joined_at ? new Date(member.joined_at).toLocaleDateString('id-ID') : '-'}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                className="text-xs text-[#E76F51] hover:text-[#d35b3e] font-semibold px-2 py-0.5 hover:bg-[#FCE8E3] rounded-md transition-colors"
                                                                title="Nonaktifkan Anggota"
                                                            >
                                                                Keluarkan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ) : (
                        <Card className="text-center py-12 border-[#D9E2EA]">
                            <Building2 className="w-12 h-12 text-[#536170] mx-auto mb-3 opacity-60" />
                            <h3 className="text-base font-bold text-[#17202A]">Pilih Ekstrakurikuler</h3>
                            <p className="text-xs text-[#536170] mt-1">Pilih eskul dari menu sebelah kiri untuk melihat detail.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal Create Eskul */}
            <Modal
                show={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Tambah Ekstrakurikuler Baru"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <Input
                        label="Nama Ekstrakurikuler"
                        placeholder="Contoh: Paskibra, PMR, Rohis, Basket"
                        value={createForm.data.name}
                        onChange={(e) => createForm.setData('name', e.target.value)}
                        error={createForm.errors.name}
                        required
                    />

                    <div>
                        <label className="text-xs font-bold text-[#536170] uppercase tracking-wider block mb-1">
                            Deskripsi Singkat
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Deskripsi kegiatan atau profil eskul..."
                            value={createForm.data.description}
                            onChange={(e) => createForm.setData('description', e.target.value)}
                            className="w-full text-sm rounded-lg border border-[#D9E2EA] px-3 py-2 focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none bg-white text-[#17202A]"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-[#D9E2EA]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={createForm.processing}
                        >
                            Simpan Eskul
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Add Member */}
            <Modal
                show={addMemberModalOpen}
                onClose={() => setAddMemberModalOpen(false)}
                title={`Tambah Anggota ke ${selectedEskul?.name}`}
            >
                <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-[#536170] uppercase tracking-wider block mb-1">
                            Pilih Siswa
                        </label>
                        <div className="relative mb-2">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-[#536170]" />
                            <input
                                type="text"
                                placeholder="Cari nama atau NISN siswa..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9E2EA] rounded-lg focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none bg-white text-[#17202A]"
                            />
                        </div>

                        <select
                            value={addMemberForm.data.user_id}
                            onChange={(e) => addMemberForm.setData('user_id', e.target.value)}
                            className="w-full text-xs border border-[#D9E2EA] rounded-lg px-3 py-2 focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none bg-white text-[#17202A]"
                            required
                        >
                            <option value="">-- Pilih Siswa ({filteredStudents.length} tersedia) --</option>
                            {filteredStudents.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.nisn || '-'}) - {s.student_profile?.class_room?.name || 'Tanpa Kelas'}
                                </option>
                            ))}
                        </select>
                        {addMemberForm.errors.user_id && (
                            <p className="text-xs text-[#E76F51] mt-1">{addMemberForm.errors.user_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#536170] uppercase tracking-wider block mb-1">
                            Jabatan / Peran
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Anggota, Ketua, Sekretaris"
                            value={addMemberForm.data.position}
                            onChange={(e) => addMemberForm.setData('position', e.target.value)}
                            className="w-full text-xs border border-[#D9E2EA] rounded-lg px-3 py-2 focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA] focus:outline-none bg-white text-[#17202A]"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-[#D9E2EA]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setAddMemberModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={addMemberForm.processing || !addMemberForm.data.user_id}
                        >
                            Daftarkan Siswa
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
