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
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {label} {required && <span className="text-rose-500" aria-hidden="true">*</span>}
                    {required && <span className="sr-only">(wajib diisi)</span>}
                </label>
            )}
            <div className="relative rounded-xl shadow-xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    id={inputId}
                    type={type}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={describedBy}
                    className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        Icon ? 'pl-10' : ''
                    } ${
                        error
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/20'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p id={helperId} className="mt-1 text-xs text-slate-500">
                    {helperText}
                </p>
            )}
        </div>
    );
}
