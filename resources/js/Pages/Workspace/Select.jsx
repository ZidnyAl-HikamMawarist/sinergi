import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, Shield, BookOpen, Building2, User, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
            <Head title="Pilih Workspace" />

            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Multi-Role Switcher
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Pilih Workspace Anda
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Halo, <span className="font-bold text-slate-800">{user?.name}</span>! Akun Anda memiliki beberapa peran aktif. Silakan pilih ruang kerja yang ingin Anda kelola.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <Badge status={ws.id}>{ws.badge}</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {ws.name}
                                    </h3>
                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                        {ws.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                                    <span>Buka Workspace</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
