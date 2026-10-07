import React from 'react';

export default function Badge({
    children,
    status,
    role,
    variant,
    className = '',
    size = 'md',
}) {
    let style = 'bg-[#F3F8FC] text-[#465362] border-[#D7E0E8]';

    // Status Presensi
    if (status === 'hadir') {
        style = 'bg-[#EBF5F0] text-[#25805A] border-[#25805A]/30 font-semibold';
    } else if (status === 'izin') {
        style = 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]/30 font-semibold';
    } else if (status === 'sakit') {
        style = 'bg-[#E8F2FA] text-[#123B5D] border-[#1769AA]/30 font-semibold';
    } else if (status === 'alpa') {
        style = 'bg-[#FDF2F2] text-[#C24141] border-[#C24141]/30 font-semibold';
    }
    // Status Transaksi Kas
    else if (status === 'valid') {
        style = 'bg-[#EBF5F0] text-[#25805A] border-[#25805A]/30 font-semibold';
    } else if (status === 'void') {
        style = 'bg-[#F6F8FB] text-[#718096] border-[#D7E0E8] line-through';
    }
    // Status Aktivitas & Umum
    else if (status === 'aktif' || status === 'dibuka') {
        style = 'bg-[#EBF5F0] text-[#25805A] border-[#25805A]/30 font-semibold';
    } else if (status === 'draft') {
        style = 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]/30 font-semibold';
    } else if (status === 'ditutup' || status === 'nonaktif') {
        style = 'bg-[#F6F8FB] text-[#718096] border-[#D7E0E8]';
    }
    // Roles
    else if (role === 'super_admin' || role === 'admin') {
        style = 'bg-[#123B5D] text-white border-transparent font-semibold';
    } else if (role === 'bendahara') {
        style = 'bg-[#FEF8EC] text-[#D9901A] border-[#D9901A]/30 font-semibold';
    } else if (role === 'pengurus_eskul') {
        style = 'bg-[#E8F2FA] text-[#123B5D] border-[#1769AA]/30 font-semibold';
    } else if (role === 'siswa') {
        style = 'bg-[#F3F8FC] text-[#465362] border-[#D7E0E8] font-semibold';
    }

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[11px]',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center rounded-md border tracking-wide uppercase text-[11px] ${style} ${sizes[size] || sizes.md} ${className}`}
        >
            {children}
        </span>
    );
}
