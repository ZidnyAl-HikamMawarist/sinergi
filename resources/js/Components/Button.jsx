import React from 'react';

export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    children,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
        primary: 'bg-[#1769AA] hover:bg-[#0F4F82] active:bg-[#123B5D] text-white shadow-xs focus:ring-[#1769AA] border border-transparent font-semibold',
        secondary: 'bg-white hover:bg-[#F3F8FC] text-[#17202A] border border-[#D7E0E8] shadow-xs focus:ring-[#1769AA]',
        subtle: 'bg-[#E8F2FA] hover:bg-[#C7DFEE] text-[#123B5D] border border-[#C7DFEE] focus:ring-[#1769AA] font-semibold',
        success: 'bg-[#25805A] hover:bg-[#1D6949] text-white shadow-xs focus:ring-[#25805A] border border-transparent font-semibold',
        danger: 'bg-[#C24141] hover:bg-[#A53232] text-white shadow-xs focus:ring-[#C24141] border border-transparent font-semibold',
        warning: 'bg-[#B7791F] hover:bg-[#975F14] text-white shadow-xs focus:ring-[#B7791F] border border-transparent font-semibold',
        outline: 'border border-[#D7E0E8] bg-white hover:bg-[#F3F8FC] text-[#17202A] focus:ring-[#1769AA] shadow-xs',
        ghost: 'text-[#465362] hover:text-[#17202A] hover:bg-[#F3F8FC] focus:ring-[#D7E0E8]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
