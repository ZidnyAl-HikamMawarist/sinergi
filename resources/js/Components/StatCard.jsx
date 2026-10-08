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
            bg: 'bg-[#E8F4FB] text-[#1769AA]',
            border: 'border-l-4 border-l-[#1769AA]',
            badge: 'text-[#1769AA]',
        },
        blue: {
            bg: 'bg-[#E8F4FB] text-[#1769AA]',
            border: 'border-l-4 border-l-[#1769AA]',
            badge: 'text-[#1769AA]',
        },
        success: {
            bg: 'bg-[#E4F4ED] text-[#2A9D6F]',
            border: 'border-l-4 border-l-[#2A9D6F]',
            badge: 'text-[#2A9D6F]',
        },
        green: {
            bg: 'bg-[#E4F4ED] text-[#2A9D6F]',
            border: 'border-l-4 border-l-[#2A9D6F]',
            badge: 'text-[#2A9D6F]',
        },
        warning: {
            bg: 'bg-[#FFF4D6] text-[#B27B10]',
            border: 'border-l-4 border-l-[#F4B942]',
            badge: 'text-[#B27B10]',
        },
        yellow: {
            bg: 'bg-[#FFF4D6] text-[#B27B10]',
            border: 'border-l-4 border-l-[#F4B942]',
            badge: 'text-[#B27B10]',
        },
        accent: {
            bg: 'bg-[#FFF4D6] text-[#B27B10]',
            border: 'border-l-4 border-l-[#F4B942]',
            badge: 'text-[#B27B10]',
        },
        danger: {
            bg: 'bg-[#FCE8E3] text-[#E76F51]',
            border: 'border-l-4 border-l-[#E76F51]',
            badge: 'text-[#E76F51]',
        },
        coral: {
            bg: 'bg-[#FCE8E3] text-[#E76F51]',
            border: 'border-l-4 border-l-[#E76F51]',
            badge: 'text-[#E76F51]',
        },
        neutral: {
            bg: 'bg-[#F5F7FA] text-[#536170]',
            border: 'border-l-4 border-l-[#536170]',
            badge: 'text-[#536170]',
        },
    };

    const scheme = colorStyles[color] || colorStyles.primary;

    return (
        <div
            className={`bg-white rounded-xl p-5 border border-[#D9E2EA] shadow-xs ${scheme.border} ${className}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536170] block truncate">
                        {title}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#17202A] tracking-tight mt-1.5 truncate">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs text-[#536170] truncate font-medium">
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
