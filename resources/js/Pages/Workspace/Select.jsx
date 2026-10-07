import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Shield, BookOpen, Building2, User, ArrowRight } from 'lucide-react';
import Badge from '@/Components/Badge';

export default function SelectWorkspace({ workspaces = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const getIcon = (id) => {
        switch (id) {
            case 'admin': return Shield;
            case 'bendahara': return BookOpen;
            case 'pengurus_eskul': return Building2;
            default: return User;
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 sm:p-6 text-[#17212B] selection:bg-[#1F4E79] selection:text-white">
            <Head title="Pilih Workspace" />

            <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#EAF2F8] border border-[#cee0f0] text-[#1F4E79] text-xs font-semibold mb-2.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Pemilihan Ruang Kerja</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#17212B] tracking-tight">
                        Pilih Workspace Anda
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-[#737D86] max-w-md mx-auto">
                        Selamat datang, <span className="font-semibold text-[#17212B]">{user?.name}</span>. Silakan pilih ruang kerja sesuai tugas Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workspaces.map((ws) => {
                        const Icon = getIcon(ws.id);
                        const targetUrl = ws.route === 'admin.dashboard' ? '/admin/dashboard'
                            : ws.route === 'kas.dashboard' ? '/kas/dashboard'
                            : ws.route === 'eskul.dashboard' ? '/eskul/dashboard'
                            : '/portal/dashboard';

                        return (
                            <Link
                                key={ws.id}
                                href={targetUrl}
                                className="group bg-white rounded-lg p-5 border border-[#D9DEE3] shadow-xs hover:border-[#1F4E79] transition-colors flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-md bg-[#EAF2F8] group-hover:bg-[#1F4E79] text-[#1F4E79] group-hover:text-white flex items-center justify-center transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <Badge status={ws.id}>{ws.badge}</Badge>
                                    </div>
                                    <h2 className="text-sm font-bold text-[#17212B] group-hover:text-[#1F4E79] transition-colors">
                                        {ws.name}
                                    </h2>
                                    <p className="mt-1 text-xs text-[#737D86] leading-relaxed">
                                        {ws.description}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-[#D9DEE3] flex items-center justify-between text-xs font-semibold text-[#1F4E79]">
                                    <span>Buka Ruang Kerja</span>
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
