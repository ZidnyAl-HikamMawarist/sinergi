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
                <label htmlFor={id} className="block text-xs font-semibold text-[#17212B] mb-1.5">
                    {label} {required && <span className="text-[#C24141] font-bold">*</span>}
                </label>
            )}
            <div className="relative rounded-md shadow-xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737D86]">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    required={required}
                    className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#17212B] placeholder-[#737D86] transition-colors focus:outline-none focus:ring-1 ${
                        Icon ? 'pl-9' : ''
                    } ${
                        error
                            ? 'border-[#C24141] focus:border-[#C24141] focus:ring-[#C24141]'
                            : 'border-[#D9DEE3] focus:border-[#1F4E79] focus:ring-[#1F4E79]'
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs font-medium text-[#C24141]">{error}</p>}
            {!error && helperText && <p className="mt-1 text-xs text-[#737D86]">{helperText}</p>}
        </div>
    );
}
