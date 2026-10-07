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
        primary: 'border-t-2 border-t-[#1F4E79]',
        success: 'border-t-2 border-t-[#287D5A]',
        warning: 'border-t-2 border-t-[#B7791F]',
        danger: 'border-t-2 border-t-[#C24141]',
        neutral: 'border-t-2 border-t-[#737D86]',
    };

    return (
        <div
            className={`bg-white rounded-lg border border-[#D9DEE3] shadow-xs overflow-hidden ${
                accentColor ? accentStyles[accentColor] || '' : ''
            } ${className}`}
        >
            {(title || action) && (
                <div className="px-5 py-3.5 border-b border-[#D9DEE3] bg-[#FCFBF9] flex items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-sm font-semibold text-[#17212B]">{title}</h3>}
                        {subtitle && <p className="text-xs text-[#737D86] mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}
