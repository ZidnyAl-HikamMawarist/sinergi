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
        primary: 'border-t-2 border-t-[#1769AA]',
        success: 'border-t-2 border-t-[#25805A]',
        warning: 'border-t-2 border-t-[#B7791F]',
        danger: 'border-t-2 border-t-[#C24141]',
        neutral: 'border-t-2 border-t-[#718096]',
        accent: 'border-t-2 border-t-[#D9901A]',
    };

    return (
        <div
            className={`bg-white rounded-lg border border-[#D7E0E8] shadow-xs overflow-hidden ${
                accentColor ? accentStyles[accentColor] || '' : ''
            } ${className}`}
        >
            {(title || action) && (
                <div className="px-5 py-3.5 border-b border-[#D7E0E8] bg-[#F3F8FC] flex items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-sm font-bold text-[#17202A]">{title}</h3>}
                        {subtitle && <p className="text-xs text-[#718096] mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}
