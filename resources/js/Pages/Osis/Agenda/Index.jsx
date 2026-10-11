import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    PlusCircle,
    FileText,
    CheckCircle2,
    X,
    Search,
    BookOpen,
    Users,
    ChevronRight,
    Edit3,
    FileCheck
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { formatIndonesianDate } from '@/Utils/format';

export default function OsisAgendaIndex({
    meetings = { data: [] },
    sekbids = [],
    stats = { total: 0, dijadwalkan: 0, selesai: 0 },
    filters = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [minutesModalOpen, setMinutesModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    // Form for new meeting
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        meeting_type: 'pleno',
        osis_sekbid_id: '',
        meeting_date: new Date().toISOString().slice(0, 10),
        start_time: '13:30',
        end_time: '15:30',
        location: 'Ruang Sekretariat OSIS',
        agenda_description: '',
    });

    // Form for minutes of meeting
    const minutesForm = useForm({
        minutes_of_meeting: '',
        status: 'selesai',
    });

    const handleTypeChange = (newType) => {
        setTypeFilter(newType);
        router.get('/osis/agenda', {
            type: newType === 'all' ? undefined : newType,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }, { preserveState: true });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/osis/agenda', {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleMinutesSubmit = (e) => {
        e.preventDefault();
        if (!selectedMeeting) return;

        minutesForm.post(`/osis/agenda/${selectedMeeting.uuid}/notulen`, {
            onSuccess: () => {
                setMinutesModalOpen(false);
                setSelectedMeeting(null);
                minutesForm.reset();
            },
        });
    };

    return (
        <AppLayout
            title="Agenda & Rapat Internal OSIS"
            header="Agenda & Notulensi Rapat Internal OSIS"
            subtitle="Kalender musyawarah, koordinasi pleno 10 sekbid, dan rekam jejak notulensi digital kepengurusan OSIS."
            actions={
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        reset();
                        setCreateModalOpen(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Jadwalkan Rapat
                </Button>
            }
        >
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-blue-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Agenda Rapat</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Tahun ajaran aktif</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dijadwalkan</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.dijadwalkan || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Agenda mendatang</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-600">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selesai / Ada Notulensi</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.selesai || 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Notulensi tersimpan</p>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Card className="p-3 mb-6">
                <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => handleTypeChange('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            typeFilter === 'all' ? 'bg-[#1769AA] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Semua Agenda ({stats.total || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('pleno')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            typeFilter === 'pleno' ? 'bg-[#1769AA] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Sidang Pleno
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('presidium')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            typeFilter === 'presidium' ? 'bg-[#1769AA] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Rapat Presidium
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('koordinasi_sekbid')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            typeFilter === 'koordinasi_sekbid' ? 'bg-[#1769AA] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Koordinasi Sekbid
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange('evaluasi')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            typeFilter === 'evaluasi' ? 'bg-[#1769AA] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Evaluasi Kinerja
                    </button>
                </div>
            </Card>

            {/* Meetings Timeline */}
            <div className="space-y-3.5">
                {meetings.data.length === 0 ? (
                    <Card className="p-10 text-center text-gray-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Tidak ada agenda rapat yang terdaftar.</p>
                    </Card>
                ) : (
                    meetings.data.map((meeting) => (
                        <Card key={meeting.id} className="p-4 sm:p-5 hover:border-blue-200 transition-all border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant={
                                                meeting.meeting_type === 'pleno' ? 'primary' :
                                                meeting.meeting_type === 'presidium' ? 'purple' :
                                                meeting.meeting_type === 'evaluasi' ? 'warning' : 'info'
                                            }
                                            className="text-[10px] uppercase font-bold"
                                        >
                                            {meeting.meeting_type.replace('_', ' ')}
                                        </Badge>
                                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                            {meeting.title}
                                        </h3>
                                        <Badge
                                            variant={meeting.status === 'selesai' ? 'success' : 'secondary'}
                                            className="text-[10px] capitalize"
                                        >
                                            {meeting.status}
                                        </Badge>
                                    </div>

                                    {meeting.agenda_description && (
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {meeting.agenda_description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                            {formatIndonesianDate(meeting.meeting_date)}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            {meeting.start_time} {meeting.end_time ? `- ${meeting.end_time} WIB` : 'WIB'}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {meeting.location}
                                        </span>
                                        {meeting.sekbid && (
                                            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                Sekbid {meeting.sekbid.number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Notulensi Preview if exists */}
                                    {meeting.minutes_of_meeting && (
                                        <div className="mt-3 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                                            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                                Notulensi Hasil Rapat:
                                            </div>
                                            <p className="whitespace-pre-line leading-relaxed text-gray-700">
                                                {meeting.minutes_of_meeting}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="shrink-0 pt-2 sm:pt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMeeting(meeting);
                                            minutesForm.setData('minutes_of_meeting', meeting.minutes_of_meeting || '');
                                            minutesForm.setData('status', 'selesai');
                                            setMinutesModalOpen(true);
                                        }}
                                    >
                                        <Edit3 className="w-4 h-4 mr-1.5 text-blue-600" />
                                        {meeting.minutes_of_meeting ? 'Edit Notulensi' : 'Catat Notulensi'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal: Jadwalkan Rapat */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-900">Jadwalkan Rapat Internal OSIS</h3>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Judul Agenda / Rapat</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Rapat Pleno Koordinasi Program Kerja Triwulan I"
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.title && <p className="text-red-600 text-[11px] mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tipe Pertemuan</label>
                                    <select
                                        value={data.meeting_type}
                                        onChange={(e) => setData('meeting_type', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="pleno">Sidang Pleno</option>
                                        <option value="presidium">Rapat Presidium</option>
                                        <option value="koordinasi_sekbid">Koordinasi Sekbid</option>
                                        <option value="evaluasi">Evaluasi Kinerja</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Sekbid Terkait (Opsional)</label>
                                    <select
                                        value={data.osis_sekbid_id}
                                        onChange={(e) => setData('osis_sekbid_id', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Lembaga OSIS Umum</option>
                                        {sekbids.map((s) => (
                                            <option key={s.id} value={s.id}>Sekbid {s.number}: {s.short_title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={data.meeting_date}
                                        onChange={(e) => setData('meeting_date', e.target.value)}
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.meeting_date && <p className="text-red-600 text-[11px] mt-1">{errors.meeting_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Mulai (WIB)</label>
                                    <input
                                        type="text"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        placeholder="13:30"
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        required
                                    />
                                    {errors.start_time && <p className="text-red-600 text-[11px] mt-1">{errors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Selesai (WIB)</label>
                                    <input
                                        type="text"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        placeholder="15:30"
                                        className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Tempat / Lokasi</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Ruang OSIS / Aula Utama / Google Meet"
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.location && <p className="text-red-600 text-[11px] mt-1">{errors.location}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Agenda / Topik Pembahasan</label>
                                <textarea
                                    rows="2"
                                    value={data.agenda_description}
                                    onChange={(e) => setData('agenda_description', e.target.value)}
                                    placeholder="Rincian poin pembahasan rapat..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCreateModalOpen(false)}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Jadwalkan Rapat'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Catat Notulensi */}
            {minutesModalOpen && selectedMeeting && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-900">
                                Notulensi Rapat: {selectedMeeting.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setMinutesModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleMinutesSubmit} className="p-6 space-y-4 text-xs">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="font-semibold text-gray-900">{formatIndonesianDate(selectedMeeting.meeting_date)} | {selectedMeeting.location}</p>
                                <p className="text-gray-500 mt-0.5">{selectedMeeting.agenda_description || 'Tanpa deskripsi agenda.'}</p>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">
                                    Hasil Keputusan & Notulensi Resmi Rapat
                                </label>
                                <textarea
                                    rows="7"
                                    value={minutesForm.data.minutes_of_meeting}
                                    onChange={(e) => minutesForm.setData('minutes_of_meeting', e.target.value)}
                                    placeholder="Tuliskan poin-poin hasil rapat, kesepakatan mufakat, penugasan tindak lanjut (action items), dan tenggat waktu..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed"
                                    required
                                />
                                {minutesForm.errors.minutes_of_meeting && (
                                    <p className="text-red-600 text-[11px] mt-1">{minutesForm.errors.minutes_of_meeting}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMinutesModalOpen(false)}
                                    disabled={minutesForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={minutesForm.processing}
                                >
                                    {minutesForm.processing ? 'Menyimpan...' : 'Simpan Notulensi & Selesaikan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
