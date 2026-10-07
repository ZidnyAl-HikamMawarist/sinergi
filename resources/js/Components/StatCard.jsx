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
            bg: 'bg-[#EAF2F8] text-[#1F4E79]',
            border: 'border-l-3 border-l-[#1F4E79]',
        },
        success: {
            bg: 'bg-[#EBF5F0] text-[#287D5A]',
            border: 'border-l-3 border-l-[#287D5A]',
        },
        warning: {
            bg: 'bg-[#FEF8EC] text-[#B7791F]',
            border: 'border-l-3 border-l-[#B7791F]',
        },
        accent: {
            bg: 'bg-[#FEF8EC] text-[#B7791F]',
            border: 'border-l-3 border-l-[#B7791F]',
        },
        danger: {
            bg: 'bg-[#FDF2F2] text-[#C24141]',
            border: 'border-l-3 border-l-[#C24141]',
        },
        neutral: {
            bg: 'bg-[#F7F5F0] text-[#46515C]',
            border: 'border-l-3 border-l-[#737D86]',
        },
    };

    const scheme = colorStyles[color] || colorStyles.primary;

    return (
        <div
            className={`bg-white rounded-lg p-4 border border-[#D9DEE3] shadow-xs ${scheme.border} ${className}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737D86] block truncate">
                        {title}
                    </span>
                    <div className="text-2xl font-bold text-[#17212B] tracking-tight mt-1 truncate">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="mt-0.5 text-xs text-[#737D86] truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-md shrink-0 ${scheme.bg}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
}
