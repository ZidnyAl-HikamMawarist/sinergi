import React from 'react';

export default function Badge({
    children,
    status,
    role,
    variant,
    className = '',
    size = 'md',
}) {
    let style = 'bg-slate-100 text-slate-700 border-slate-200';

    // Status Presensi
    if (status === 'hadir') {
        style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    } else if (status === 'izin') {
        style = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    } else if (status === 'sakit') {
        style = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
    } else if (status === 'alpa') {
        style = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    }
    // Status Transaksi Kas
    else if (status === 'valid') {
        style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    } else if (status === 'void') {
        style = 'bg-slate-100 text-slate-500 border-slate-300 line-through';
    }
    // Status Aktivitas & Umum
    else if (status === 'aktif' || status === 'dibuka') {
        style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    } else if (status === 'draft') {
        style = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    } else if (status === 'ditutup' || status === 'nonaktif') {
        style = 'bg-slate-100 text-slate-600 border-slate-300';
    }
    // Roles
    else if (role === 'super_admin' || role === 'admin') {
        style = 'bg-violet-100 text-violet-800 border-violet-300 font-semibold';
    } else if (role === 'bendahara') {
        style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    } else if (role === 'pengurus_eskul') {
        style = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
    } else if (role === 'siswa') {
        style = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border tracking-wide uppercase ${style} ${sizes[size]} ${className}`}
        >
            {children}
        </span>
    );
}
