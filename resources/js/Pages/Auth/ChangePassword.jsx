import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center items-center p-4 selection:bg-[#1F4E79] selection:text-white">
            <Head title="Ganti Kata Sandi" />

            <div className="w-full max-w-sm">
                <FlashMessage />

                <div className="bg-white rounded-lg p-6 shadow-xs border border-[#D9DEE3]">
                    <div className="w-9 h-9 rounded-md bg-[#FEF8EC] text-[#B7791F] flex items-center justify-center mb-3">
                        <KeyRound className="w-5 h-5" />
                    </div>

                    <h1 className="text-base font-bold text-[#17212B]">
                        Pembaruan Kata Sandi
                    </h1>
                    <p className="text-xs text-[#737D86] mt-1 mb-5">
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
                            size="md"
                            className="w-full mt-2"
                            loading={processing}
                        >
                            Simpan & Lanjutkan
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
