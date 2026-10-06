import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Sparkles, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FlashMessage from '@/Components/FlashMessage';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        identifier: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillDevAccount = (identifier, password) => {
        setData((prev) => ({
            ...prev,
            identifier,
            password,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
            <Head title="Masuk ke Sistem" />

            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                            SINERGI
                        </span>
                    </Link>
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                        Sistem Integrasi Ekstrakurikuler dan Organisasi
                    </p>
                </div>

                <FlashMessage />

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 border border-slate-200/80">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Masuk menggunakan NISN (siswa) atau alamat email resmi Anda.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="identifier"
                            label="NISN / Email"
                            placeholder="Contoh: 0051234567 atau admin@sinergi.test"
                            icon={User}
                            value={data.identifier}
                            onChange={(e) => setData('identifier', e.target.value)}
                            error={errors.identifier}
                            required
                            autoFocus
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Kata Sandi"
                            placeholder="••••••••"
                            icon={Lock}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                        />

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center text-slate-600 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mr-2"
                                />
                                Ingat saya di perangkat ini
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full mt-2"
                            loading={processing}
                        >
                            Masuk Sekarang
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    {/* Quick Dev Accounts Helper */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Akun Demo (Uji Coba Lokal):
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <button
                                type="button"
                                onClick={() => fillDevAccount('admin@sinergi.test', 'password123')}
                                className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-left transition-colors"
                            >
                                🔑 Admin OSIS
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('bendahara@sinergi.test', 'password123')}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-left transition-colors"
                            >
                                💰 Bendahara
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('pengurus@sinergi.test', 'password123')}
                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-left transition-colors"
                            >
                                ⛺ Pengurus Pramuka
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('0051234562', 'password123')}
                                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-left transition-colors"
                            >
                                🎓 Siswa (Ahmad)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-500">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
