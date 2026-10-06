import React from 'react';

export default function Card({
    children,
    title,
    subtitle,
    action,
    accentColor,
    className = '',
}) {
    const accentStyles = {
        primary: 'border-t-4 border-t-blue-500',
        secondary: 'border-t-4 border-t-violet-500',
        accent: 'border-t-4 border-t-amber-500',
        success: 'border-t-4 border-t-emerald-500',
        danger: 'border-t-4 border-t-rose-500',
    };

    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden ${
                accentColor ? accentStyles[accentColor] : ''
            } ${className}`}
        >
            {(title || action) && (
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}
