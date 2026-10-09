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
        ? 'text-sm sm:text-base lg:text-xs xl:text-sm font-extrabold'
        : isLong
        ? 'text-base sm:text-lg lg:text-[15px] xl:text-lg 2xl:text-xl font-extrabold'
        : 'text-2xl sm:text-3xl font-extrabold';

    return (
        <div
            className={`rounded-xl p-4 sm:p-5 border ${scheme.cardBorder} ${scheme.cardBg} ${scheme.accentBorder} shadow-xs ${className}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#536170] block truncate">
                        {title}
                    </span>
                    <div
                        className={`${valueSizeClass} ${scheme.valueText} tracking-tight mt-1.5 whitespace-nowrap`}
                        title={valString}
                    >
                        {value}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs text-[#536170] truncate font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-lg shrink-0 ${scheme.iconBg}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
