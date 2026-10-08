import React from 'react';

export default function Input({
    label,
    id,
    type = 'text',
    error,
    helperText,
    icon: Icon,
    className = '',
    required = false,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-xs font-bold text-[#17202A] mb-1.5">
                    {label} {required && <span className="text-[#E76F51] font-bold">*</span>}
                </label>
            )}
            <div className="relative rounded-lg shadow-xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#536170]">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    required={required}
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#17202A] placeholder-[#536170] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        Icon ? 'pl-9' : ''
                    } ${
                        error
                            ? 'border-[#E76F51] focus:border-[#E76F51] focus:ring-[#E76F51]'
                            : 'border-[#D9E2EA] focus:border-[#1769AA] focus:ring-[#1769AA]'
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs font-semibold text-[#E76F51]">{error}</p>}
            {!error && helperText && <p className="mt-1 text-xs text-[#536170]">{helperText}</p>}
        </div>
    );
}
