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
        primary: 'border-t-4 border-t-[#1769AA]',
        blue: 'border-t-4 border-t-[#1769AA]',
        success: 'border-t-4 border-t-[#2A9D6F]',
        green: 'border-t-4 border-t-[#2A9D6F]',
        warning: 'border-t-4 border-t-[#F4B942]',
        yellow: 'border-t-4 border-t-[#F4B942]',
        danger: 'border-t-4 border-t-[#E76F51]',
        coral: 'border-t-4 border-t-[#E76F51]',
        accent: 'border-t-4 border-t-[#F4B942]',
        neutral: 'border-t-4 border-t-[#536170]',
    };

    return (
        <div
            className={`bg-white rounded-xl border border-[#D9E2EA] shadow-xs overflow-hidden ${
                accentColor ? accentStyles[accentColor] || '' : ''
            } ${className}`}
        >
            {(title || action) && (
                <div className="px-5 py-3.5 border-b border-[#D9E2EA] bg-[#F5F7FA] flex items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-sm font-bold text-[#17202A]">{title}</h3>}
                        {subtitle && <p className="text-xs text-[#536170] mt-0.5 font-medium">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}
