import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    show = false,
    onClose,
    title,
    children,
    maxWidth = 'md',
}) {
    useEffect(() => {
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
                className="fixed inset-0 bg-[#17212B]/40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Dialog */}
            <div
                className={`relative w-full ${
                    maxWidthClasses[maxWidth] || maxWidthClasses.md
                } bg-white rounded-lg shadow-lg border border-[#D9DEE3] overflow-hidden transform transition-all z-10`}
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <div className="px-5 py-3.5 border-b border-[#D9DEE3] bg-[#FCFBF9] flex items-center justify-between gap-4">
                        <h3 className="text-sm font-semibold text-[#17212B]">{title}</h3>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 rounded-md text-[#737D86] hover:text-[#17212B] hover:bg-[#D9DEE3]/40 transition-colors focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
