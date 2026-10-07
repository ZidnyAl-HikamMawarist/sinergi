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
        primary: 'bg-[#1F4E79] hover:bg-[#173A5C] active:bg-[#122941] text-white shadow-xs focus:ring-[#1F4E79] border border-transparent',
        secondary: 'bg-white hover:bg-[#F7F5F0] text-[#17212B] border border-[#D9DEE3] shadow-xs focus:ring-[#1F4E79]',
        subtle: 'bg-[#EAF2F8] hover:bg-[#cee0f0] text-[#1F4E79] border border-[#cee0f0] focus:ring-[#1F4E79]',
        success: 'bg-[#287D5A] hover:bg-[#20674A] text-white shadow-xs focus:ring-[#287D5A] border border-transparent',
        danger: 'bg-[#C24141] hover:bg-[#A53232] text-white shadow-xs focus:ring-[#C24141] border border-transparent',
        warning: 'bg-[#B7791F] hover:bg-[#975F14] text-white shadow-xs focus:ring-[#B7791F] border border-transparent',
        outline: 'border border-[#D9DEE3] bg-white hover:bg-[#F7F5F0] text-[#17212B] focus:ring-[#1F4E79] shadow-xs',
        ghost: 'text-[#46515C] hover:text-[#17212B] hover:bg-[#EAF2F8]/60 focus:ring-[#D9DEE3]',
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
