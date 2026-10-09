import React from 'react';

export default function Badge({
    children,
    status,
    role,
    variant,
    className = '',
    size = 'md',
}) {
    let style = 'bg-[#F5F7FA] text-[#536170] border-[#D9E2EA]';

    // Status Presensi
    if (status === 'hadir') {
        style = 'bg-[#E4F4ED] text-[#2A9D6F] border-[#2A9D6F]/30 font-bold';
    } else if (status === 'izin') {
        style = 'bg-[#FFF4D6] text-[#B27B10] border-[#F4B942]/40 font-bold';
    } else if (status === 'sakit') {
        style = 'bg-[#E8F4FB] text-[#1769AA] border-[#1769AA]/30 font-bold';
    } else if (status === 'alpa') {
        style = 'bg-[#FCE8E3] text-[#E76F51] border-[#E76F51]/30 font-bold';
    }
    // Status Transaksi Kas
    else if (status === 'valid') {
        style = 'bg-[#E4F4ED] text-[#2A9D6F] border-[#2A9D6F]/30 font-bold';
    } else if (status === 'void') {
        style = 'bg-[#F5F7FA] text-[#536170] border-[#D9E2EA] line-through font-medium';
    }
    // Status Aktivitas & Umum
    else if (status === 'aktif' || status === 'dibuka') {
        style = 'bg-[#E4F4ED] text-[#2A9D6F] border-[#2A9D6F]/30 font-bold';
    } else if (status === 'draft') {
        style = 'bg-[#FFF4D6] text-[#B27B10] border-[#F4B942]/40 font-bold';
    } else if (status === 'ditutup' || status === 'nonaktif') {
        style = 'bg-[#F5F7FA] text-[#536170] border-[#D9E2EA] font-medium';
    }
    // Variants explicitly requested
    else if (variant === 'primary' || variant === 'blue') {
        style = 'bg-[#E8F4FB] text-[#1769AA] border-[#1769AA]/30 font-bold';
    } else if (variant === 'success' || variant === 'green') {
        style = 'bg-[#E4F4ED] text-[#2A9D6F] border-[#2A9D6F]/30 font-bold';
    } else if (variant === 'warning' || variant === 'yellow') {
        style = 'bg-[#FFF4D6] text-[#B27B10] border-[#F4B942]/40 font-bold';
    } else if (variant === 'danger' || variant === 'coral') {
        style = 'bg-[#FCE8E3] text-[#E76F51] border-[#E76F51]/30 font-bold';
    } else if (variant === 'navy') {
        style = 'bg-[#123B5D] text-white border-transparent font-bold';
    }
    // Roles
    else if (role === 'super_admin' || role === 'admin') {
        style = 'bg-[#123B5D] text-white border-transparent font-bold';
    } else if (role === 'bendahara') {
        style = 'bg-[#FFF4D6] text-[#B27B10] border-[#F4B942]/40 font-bold';
    } else if (role === 'pengurus_eskul') {
        style = 'bg-[#E8F4FB] text-[#1769AA] border-[#1769AA]/30 font-bold';
    } else if (role === 'siswa') {
        style = 'bg-[#F5F7FA] text-[#536170] border-[#D9E2EA] font-bold';
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center rounded-md border tracking-wide uppercase text-[11px] ${style} ${sizes[size] || sizes.md} ${className}`}
        >
            {children}
        </span>
    );
}
