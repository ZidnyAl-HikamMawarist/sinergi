import React from 'react';

export default function Badge({
    children,
    status,
    role,
    variant,
    className = '',
    size = 'md',
}) {
    let style = 'bg-[#F7F5F0] text-[#46515C] border-[#D9DEE3]';

    // Status Presensi
    if (status === 'hadir') {
        style = 'bg-[#EBF5F0] text-[#287D5A] border-[#287D5A]/30 font-medium';
    } else if (status === 'izin') {
        style = 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]/30 font-medium';
    } else if (status === 'sakit') {
        style = 'bg-[#EAF2F8] text-[#1F4E79] border-[#1F4E79]/30 font-medium';
    } else if (status === 'alpa') {
        style = 'bg-[#FDF2F2] text-[#C24141] border-[#C24141]/30 font-medium';
    }
    // Status Transaksi Kas
    else if (status === 'valid') {
        style = 'bg-[#EBF5F0] text-[#287D5A] border-[#287D5A]/30 font-medium';
    } else if (status === 'void') {
        style = 'bg-[#F7F5F0] text-[#737D86] border-[#D9DEE3] line-through';
    }
    // Status Aktivitas & Umum
    else if (status === 'aktif' || status === 'dibuka') {
        style = 'bg-[#EBF5F0] text-[#287D5A] border-[#287D5A]/30 font-medium';
    } else if (status === 'draft') {
        style = 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]/30 font-medium';
    } else if (status === 'ditutup' || status === 'nonaktif') {
        style = 'bg-[#F7F5F0] text-[#737D86] border-[#D9DEE3]';
    }
    // Roles
    else if (role === 'super_admin' || role === 'admin') {
        style = 'bg-[#1F4E79] text-white border-transparent font-medium';
    } else if (role === 'bendahara') {
        style = 'bg-[#EBF5F0] text-[#287D5A] border-[#287D5A]/30 font-medium';
    } else if (role === 'pengurus_eskul') {
        style = 'bg-[#EAF2F8] text-[#1F4E79] border-[#1F4E79]/30 font-medium';
    } else if (role === 'siswa') {
        style = 'bg-[#F7F5F0] text-[#46515C] border-[#D9DEE3] font-medium';
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
