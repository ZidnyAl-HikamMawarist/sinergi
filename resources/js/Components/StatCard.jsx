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
            cardBg: 'bg-[#F2F8FD]',
            cardBorder: 'border-[#CDE3F3]',
            accentBorder: 'border-l-4 border-l-[#1769AA]',
            iconBg: 'bg-[#E8F4FB] text-[#1769AA]',
            valueText: 'text-[#123B5D]',
        },
        blue: {
            cardBg: 'bg-[#F2F8FD]',
            cardBorder: 'border-[#CDE3F3]',
            accentBorder: 'border-l-4 border-l-[#1769AA]',
            iconBg: 'bg-[#E8F4FB] text-[#1769AA]',
            valueText: 'text-[#123B5D]',
        },
        sky: {
            cardBg: 'bg-[#F4F9FC]',
            cardBorder: 'border-[#CFE5F5]',
            accentBorder: 'border-l-4 border-l-[#4EA5D9]',
            iconBg: 'bg-[#E8F4FB] text-[#1769AA]',
            valueText: 'text-[#123B5D]',
        },
        success: {
            cardBg: 'bg-[#F0F9F5]',
            cardBorder: 'border-[#C5E8D8]',
            accentBorder: 'border-l-4 border-l-[#2A9D6F]',
            iconBg: 'bg-[#E4F4ED] text-[#2A9D6F]',
            valueText: 'text-[#1B6D4C]',
        },
        green: {
            cardBg: 'bg-[#F0F9F5]',
            cardBorder: 'border-[#C5E8D8]',
            accentBorder: 'border-l-4 border-l-[#2A9D6F]',
            iconBg: 'bg-[#E4F4ED] text-[#2A9D6F]',
            valueText: 'text-[#1B6D4C]',
        },
        warning: {
            cardBg: 'bg-[#FFFBF0]',
            cardBorder: 'border-[#FCE7BA]',
            accentBorder: 'border-l-4 border-l-[#F4B942]',
            iconBg: 'bg-[#FFF4D6] text-[#B27B10]',
            valueText: 'text-[#8C5D07]',
        },
        yellow: {
            cardBg: 'bg-[#FFFBF0]',
            cardBorder: 'border-[#FCE7BA]',
            accentBorder: 'border-l-4 border-l-[#F4B942]',
            iconBg: 'bg-[#FFF4D6] text-[#B27B10]',
            valueText: 'text-[#8C5D07]',
        },
        accent: {
            cardBg: 'bg-[#FFFBF0]',
            cardBorder: 'border-[#FCE7BA]',
            accentBorder: 'border-l-4 border-l-[#F4B942]',
            iconBg: 'bg-[#FFF4D6] text-[#B27B10]',
            valueText: 'text-[#8C5D07]',
        },
        danger: {
            cardBg: 'bg-[#FDF4F2]',
            cardBorder: 'border-[#F9CFC5]',
            accentBorder: 'border-l-4 border-l-[#E76F51]',
            iconBg: 'bg-[#FCE8E3] text-[#E76F51]',
            valueText: 'text-[#B84226]',
        },
        coral: {
            cardBg: 'bg-[#FDF4F2]',
            cardBorder: 'border-[#F9CFC5]',
            accentBorder: 'border-l-4 border-l-[#E76F51]',
            iconBg: 'bg-[#FCE8E3] text-[#E76F51]',
            valueText: 'text-[#B84226]',
        },
        neutral: {
            cardBg: 'bg-[#F8FAFC]',
            cardBorder: 'border-[#D9E2EA]',
            accentBorder: 'border-l-4 border-l-[#536170]',
            iconBg: 'bg-[#F5F7FA] text-[#536170]',
            valueText: 'text-[#17202A]',
        },
    };

    const scheme = colorStyles[color] || colorStyles.primary;
    const valString = String(value ?? '');
    const isVeryLong = valString.length > 15;
    const isLong = valString.length > 9;
    const valueSizeClass = isVeryLong
        ? 'text-lg sm:text-xl lg:text-lg xl:text-xl'
        : isLong
        ? 'text-xl sm:text-2xl lg:text-xl xl:text-2xl'
        : 'text-2xl sm:text-3xl';

    return (
        <div
            className={`rounded-xl p-4 sm:p-5 border ${scheme.cardBorder} ${scheme.cardBg} ${scheme.accentBorder} shadow-xs flex flex-col justify-between ${className}`}
        >
            <div>
                {/* Header Row: Label & Icon */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#536170] leading-snug">
                        {title}
                    </span>
                    {Icon && (
                        <div className={`p-2 rounded-lg shrink-0 ${scheme.iconBg}`}>
                            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                    )}
                </div>

                {/* Metric Value: Full Width */}
                <div className="mt-2.5">
                    <div
                        className={`${valueSizeClass} font-extrabold ${scheme.valueText} tracking-tight leading-tight break-normal`}
                        title={valString}
                    >
                        {value}
                    </div>
                </div>
            </div>

            {/* Subtitle: Full Width without Truncate */}
            {subtitle && (
                <p className="mt-2 text-xs text-[#536170] font-medium leading-relaxed break-words">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
