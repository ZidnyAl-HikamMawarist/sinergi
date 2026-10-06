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
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 focus:ring-blue-500 hover:-translate-y-0.5',
        secondary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25 focus:ring-violet-500 hover:-translate-y-0.5',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 focus:ring-emerald-500 hover:-translate-y-0.5',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 focus:ring-rose-500 hover:-translate-y-0.5',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 focus:ring-amber-400 hover:-translate-y-0.5',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-blue-500 shadow-xs',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
