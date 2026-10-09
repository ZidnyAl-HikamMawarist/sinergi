import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [flash]);

    if (dismissed || (!flash?.success && !flash?.error && !flash?.warning)) {
        return null;
    }

    return (
        <div className="mb-5 space-y-2">
            {flash.success && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#E4F4ED] border border-[#2A9D6F]/30 text-[#2A9D6F] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2A9D6F] shrink-0" />
                        <span className="text-xs font-bold">{flash.success}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#2A9D6F] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.error && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#FCE8E3] border border-[#E76F51]/30 text-[#E76F51] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <AlertCircle className="w-4 h-4 text-[#E76F51] shrink-0" />
                        <span className="text-xs font-bold">{flash.error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#E76F51] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.warning && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#FFF4D6] border border-[#F4B942]/40 text-[#B27B10] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <AlertTriangle className="w-4 h-4 text-[#B27B10] shrink-0" />
                        <span className="text-xs font-bold">{flash.warning}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#B27B10] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
