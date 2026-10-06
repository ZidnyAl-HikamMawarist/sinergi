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
            bg: 'bg-blue-50 text-blue-600',
            border: 'border-t-4 border-t-blue-500',
            ring: 'focus:ring-blue-400',
        },
        secondary: {
            bg: 'bg-violet-50 text-violet-600',
            border: 'border-t-4 border-t-violet-500',
            ring: 'focus:ring-violet-400',
        },
        success: {
            bg: 'bg-emerald-50 text-emerald-600',
            border: 'border-t-4 border-t-emerald-500',
            ring: 'focus:ring-emerald-400',
        },
        accent: {
            bg: 'bg-amber-50 text-amber-600',
            border: 'border-t-4 border-t-amber-500',
            ring: 'focus:ring-amber-400',
        },
        danger: {
            bg: 'bg-rose-50 text-rose-600',
            border: 'border-t-4 border-t-rose-500',
            ring: 'focus:ring-rose-400',
        },
    };

    const scheme = colorStyles[color] || colorStyles.primary;

    return (
        <div
            className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${scheme.border} ${className}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {title}
                </span>
                {Icon && (
                    <div className={`p-2.5 rounded-xl ${scheme.bg}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {value}
                </span>
            </div>
            {subtitle && (
                <p className="mt-1 text-xs text-slate-500 font-medium">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
