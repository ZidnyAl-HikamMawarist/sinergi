import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, Filter, Search, Clock, User, Globe } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';

export default function AuditLogs({ logs = { data: [] }, users = [], filters = {} }) {
    const [action, setAction] = React.useState(filters.action || '');
    const [userId, setUserId] = React.useState(filters.user_id || '');
    const [from, setFrom] = React.useState(filters.from || '');
    const [to, setTo] = React.useState(filters.to || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/admin/audit-logs', {
            action: action || undefined,
            user_id: userId || undefined,
            from: from || undefined,
            to: to || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setAction('');
        setUserId('');
        setFrom('');
        setTo('');
        router.get('/admin/audit-logs');
    };

    return (
        <AppLayout
            title="Audit Log Sistem"
            header="Audit Log Sistem (Append-Only)"
            subtitle="Seluruh aksi administratif, finansial, dan keamanan dicatat secara permanen tanpa opsi edit atau hapus."
        >
            {/* Filter Bar */}
            <Card className="mb-6" accentColor="primary">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#465362] mb-1">
                            Aksi
                        </label>
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="block w-full rounded-md border border-[#D7E0E8] bg-white px-3 py-2 text-xs font-semibold text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        >
                            <option value="">Semua Aksi</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="create_transaction">Catat Kas</option>
                            <option value="void_transaction">Void Kas</option>
                            <option value="create_session">Buka Sesi Eskul</option>
                            <option value="close_session">Tutup Sesi Eskul</option>
                            <option value="manual_attendance">Presensi Manual</option>
                            <option value="commit_student_import">Import Siswa</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#465362] mb-1">
                            Pengguna
                        </label>
                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="block w-full rounded-md border border-[#D7E0E8] bg-white px-3 py-2 text-xs text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        >
                            <option value="">Semua Pengguna</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#465362] mb-1">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="block w-full rounded-md border border-[#D7E0E8] bg-white px-3 py-2 text-xs text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#465362] mb-1">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="block w-full rounded-md border border-[#D7E0E8] bg-white px-3 py-2 text-xs text-[#17202A] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" className="flex-1">
                            <Filter className="w-3.5 h-3.5 mr-1" />
                            Filter
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Logs Table */}
            <Card
                title={`Catatan Aktivitas (${logs.total || logs.data.length})`}
                subtitle="Terurut dari yang paling terkini"
                accentColor="primary"
            >
                {logs.data.length === 0 ? (
                    <div className="text-center py-10 text-[#718096] text-xs">
                        Tidak ada log audit yang sesuai dengan filter pencarian.
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left text-xs text-[#465362]">
                            <thead className="bg-[#F3F8FC] text-[#718096] font-bold border-y border-[#D7E0E8] uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-5 py-3">Waktu</th>
                                    <th className="px-5 py-3">Pelaku</th>
                                    <th className="px-5 py-3">Aksi</th>
                                    <th className="px-5 py-3">Entitas</th>
                                    <th className="px-5 py-3">IP Address</th>
                                    <th className="px-5 py-3">Perubahan (JSON)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D7E0E8]">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#F6F8FB] transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap text-[#718096] font-mono text-[11px]">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-3 font-bold text-[#17202A] whitespace-nowrap">
                                            {log.user?.name || 'Sistem / Anonim'}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#F3F8FC] text-[#465362] border border-[#D7E0E8] uppercase">
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap font-mono text-[#718096] text-[11px]">
                                            {log.entity_type} #{log.entity_id}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap font-mono text-[#718096] text-[11px]">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-5 py-3 max-w-xs truncate text-[11px] font-mono text-[#718096]">
                                            {log.new_values ? JSON.stringify(log.new_values) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </AppLayout>
    );
}
