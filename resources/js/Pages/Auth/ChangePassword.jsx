import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import FlashMessage from '@/Components/FlashMessage';

export default function ChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/password/change');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
            <Head title="Ganti Kata Sandi" />

            <div className="w-full max-w-md">
                <FlashMessage />

                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 border border-slate-200/80">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Wajib Ganti Kata Sandi
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                        Demi keamanan akun Anda (terutama saat login pertama kali), harap buat kata sandi baru minimal 8 karakter.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="password"
                            type="password"
                            label="Kata Sandi Baru"
                            placeholder="Minimal 8 karakter"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                            autoFocus
                        />

                        <Input
                            id="password_confirmation"
                            type="password"
                            label="Konfirmasi Kata Sandi Baru"
                            placeholder="Ketik ulang kata sandi baru"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full mt-2"
                            loading={processing}
                        >
                            Simpan & Lanjutkan
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
