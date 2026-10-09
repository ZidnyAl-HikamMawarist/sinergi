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
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4 sm:p-6 text-[#17202A] selection:bg-[#1769AA] selection:text-white">
            <Head title="Pilih Workspace" />

            <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#E8F4FB] border border-[#1769AA]/30 text-[#1769AA] text-xs font-bold mb-2.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Pemilihan Ruang Kerja</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#17202A] tracking-tight">
                        Pilih Workspace Anda
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-[#536170] max-w-md mx-auto">
                        Selamat datang, <span className="font-semibold text-[#17202A]">{user?.name}</span>. Silakan pilih ruang kerja sesuai tugas Anda.
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
                                className="group bg-white rounded-xl p-5 border border-[#D9E2EA] shadow-xs hover:border-[#1769AA] transition-colors flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#E8F4FB] group-hover:bg-[#1769AA] text-[#1769AA] group-hover:text-white flex items-center justify-center transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <Badge status={ws.id}>{ws.badge}</Badge>
                                    </div>
                                    <h2 className="text-sm font-bold text-[#17202A] group-hover:text-[#1769AA] transition-colors">
                                        {ws.name}
                                    </h2>
                                    <p className="mt-1 text-xs text-[#536170] leading-relaxed">
                                        {ws.description}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-[#D9E2EA] flex items-center justify-between text-xs font-semibold text-[#1769AA]">
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
