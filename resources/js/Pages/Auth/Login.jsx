import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, User, ArrowRight, Building2 } from 'lucide-react';
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
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4 selection:bg-[#1769AA] selection:text-white">
            <Head title="Masuk ke Sistem" />

            <div className="w-full max-w-sm">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#123B5D] flex items-center justify-center text-white font-bold text-base shadow-xs">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-[#123B5D]">
                            SINERGI
                        </span>
                    </Link>
                    <p className="mt-1 text-xs text-[#536170]">
                        Sistem Integrasi Ekstrakurikuler dan Organisasi
                    </p>
                </div>

                <FlashMessage />

                {/* Login Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D9E2EA]">
                    <div className="mb-5 pb-3 border-b border-[#D9E2EA]">
                        <h1 className="text-base font-bold text-[#17202A]">Masuk ke Akun</h1>
                        <p className="text-xs text-[#536170] mt-0.5">
                            Gunakan NISN (siswa) atau alamat email resmi.
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

                        <div className="flex items-center justify-between text-xs pt-0.5">
                            <label className="flex items-center text-[#536170] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-[#D9E2EA] text-[#1769AA] focus:ring-[#1769AA] w-4 h-4 mr-2"
                                />
                                Ingat di perangkat ini
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            className="w-full mt-2"
                            loading={processing}
                        >
                            Masuk Sekarang
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                    </form>

                    {/* Quick Dev Accounts Helper */}
                    <div className="mt-6 pt-5 border-t border-[#D9E2EA]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#536170]">
                                Akun Uji Coba:
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDevAccount('admin@sinergi.test', 'password123')}
                                className="p-2 rounded-lg border border-[#D9E2EA] bg-[#F5F7FA] hover:bg-[#E8F4FB] hover:border-[#1769AA]/40 text-[#17202A] font-semibold text-left transition-colors"
                            >
                                Admin OSIS
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('bendahara@sinergi.test', 'password123')}
                                className="p-2 rounded-lg border border-[#D9E2EA] bg-[#F5F7FA] hover:bg-[#E8F4FB] hover:border-[#1769AA]/40 text-[#17202A] font-semibold text-left transition-colors"
                            >
                                Bendahara
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('pengurus@sinergi.test', 'password123')}
                                className="p-2 rounded-lg border border-[#D9E2EA] bg-[#F5F7FA] hover:bg-[#E8F4FB] hover:border-[#1769AA]/40 text-[#123B5D] font-semibold text-left transition-colors"
                            >
                                Pengurus Eskul
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('0051234562', 'password123')}
                                className="p-2 rounded-lg border border-[#D9E2EA] bg-[#F5F7FA] hover:bg-[#E8F4FB] hover:border-[#1769AA]/40 text-[#17202A] font-semibold text-left transition-colors"
                            >
                                Siswa (Ahmad)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center text-xs text-[#536170]">
                    <Link href="/" className="hover:text-[#1769AA] transition-colors font-medium">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
