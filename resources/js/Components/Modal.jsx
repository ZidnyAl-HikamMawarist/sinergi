import React from 'react';
import { X } from 'lucide-react';

export default function Modal({
    show = false,
    onClose,
    title,
    children,
    maxWidth = 'md',
}) {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && show && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, onClose]);

    if (!show) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Dialog */}
            <div
                className={`relative w-full ${
                    maxWidthClasses[maxWidth] || maxWidthClasses.md
                } bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all z-10`}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
