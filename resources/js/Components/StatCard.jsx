import React from 'react';

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'primary',
    className = '',
}) {
    const colorStyles = {
        primary: {
            bg: 'bg-[#E8F2FA] text-[#123B5D]',
            border: 'border-l-4 border-l-[#1769AA]',
        },
        success: {
            bg: 'bg-[#EBF5F0] text-[#25805A]',
            border: 'border-l-4 border-l-[#25805A]',
        },
        warning: {
            bg: 'bg-[#FEF8EC] text-[#B7791F]',
            border: 'border-l-4 border-l-[#B7791F]',
        },
        accent: {
            bg: 'bg-[#FEF8EC] text-[#D9901A]',
            border: 'border-l-4 border-l-[#D9901A]',
        },
        danger: {
            bg: 'bg-[#FDF2F2] text-[#C24141]',
            border: 'border-l-4 border-l-[#C24141]',
        },
        neutral: {
            bg: 'bg-[#F3F8FC] text-[#465362]',
            border: 'border-l-4 border-l-[#718096]',
        },
    };

    const scheme = colorStyles[color] || colorStyles.primary;

    return (
        <div
            className={`bg-white rounded-lg p-5 border border-[#D7E0E8] shadow-xs ${scheme.border} ${className}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#718096] block truncate">
                        {title}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#17202A] tracking-tight mt-2 truncate">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="mt-1.5 text-xs text-[#718096] truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-lg shrink-0 ${scheme.bg}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
