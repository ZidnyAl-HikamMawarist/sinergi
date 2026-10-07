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
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 selection:bg-[#1F4E79] selection:text-white">
            <Head title="Masuk ke Sistem" />

            <div className="w-full max-w-sm">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-md bg-[#1F4E79] flex items-center justify-center text-white font-bold text-base">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[#17212B]">
                            SINERGI
                        </span>
                    </Link>
                    <p className="mt-1 text-xs text-[#737D86]">
                        Sistem Integrasi Ekstrakurikuler dan Organisasi
                    </p>
                </div>

                <FlashMessage />

                {/* Login Card */}
                <div className="bg-white rounded-lg p-6 shadow-xs border border-[#D9DEE3]">
                    <div className="mb-5 pb-3 border-b border-[#D9DEE3]">
                        <h1 className="text-base font-bold text-[#17212B]">Masuk ke Akun</h1>
                        <p className="text-xs text-[#737D86] mt-0.5">
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
                            <label className="flex items-center text-[#46515C] cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-[#D9DEE3] text-[#1F4E79] focus:ring-[#1F4E79] w-4 h-4 mr-2"
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
                    <div className="mt-6 pt-5 border-t border-[#D9DEE3]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737D86]">
                                Akun Uji Coba:
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDevAccount('admin@sinergi.test', 'password123')}
                                className="p-2 rounded-md border border-[#D9DEE3] bg-[#FCFBF9] hover:bg-[#EAF2F8] text-[#17212B] font-medium text-left transition-colors"
                            >
                                Admin OSIS
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('bendahara@sinergi.test', 'password123')}
                                className="p-2 rounded-md border border-[#D9DEE3] bg-[#FCFBF9] hover:bg-[#EAF2F8] text-[#17212B] font-medium text-left transition-colors"
                            >
                                Bendahara
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('pengurus@sinergi.test', 'password123')}
                                className="p-2 rounded-md border border-[#D9DEE3] bg-[#FCFBF9] hover:bg-[#EAF2F8] text-[#1F4E79] font-medium text-left transition-colors"
                            >
                                Pengurus Eskul
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDevAccount('0051234562', 'password123')}
                                className="p-2 rounded-md border border-[#D9DEE3] bg-[#FCFBF9] hover:bg-[#EAF2F8] text-[#17212B] font-medium text-left transition-colors"
                            >
                                Siswa (Ahmad)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center text-xs text-[#737D86]">
                    <Link href="/" className="hover:text-[#1F4E79] transition-colors">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
