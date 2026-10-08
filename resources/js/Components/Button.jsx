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
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
        primary: 'bg-[#1769AA] hover:bg-[#0F4F82] active:bg-[#123B5D] text-white shadow-xs focus:ring-[#1769AA] border border-transparent',
        secondary: 'bg-white hover:bg-[#E8F4FB] text-[#1769AA] border border-[#1769AA] shadow-xs focus:ring-[#1769AA]',
        subtle: 'bg-[#E8F4FB] hover:bg-[#C9E4F5] text-[#123B5D] border border-[#C9E4F5] focus:ring-[#1769AA]',
        success: 'bg-[#2A9D6F] hover:bg-[#23825C] text-white shadow-xs focus:ring-[#2A9D6F] border border-transparent',
        warning: 'bg-[#F4B942] hover:bg-[#DFA330] text-[#17202A] shadow-xs focus:ring-[#F4B942] border border-transparent font-bold',
        danger: 'bg-[#E76F51] hover:bg-[#CF5B3F] text-white shadow-xs focus:ring-[#E76F51] border border-transparent',
        outline: 'border border-[#D9E2EA] bg-white hover:bg-[#F5F7FA] text-[#17202A] focus:ring-[#1769AA] shadow-xs',
        ghost: 'text-[#536170] hover:text-[#17202A] hover:bg-[#E8F4FB] focus:ring-[#D9E2EA]',
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
