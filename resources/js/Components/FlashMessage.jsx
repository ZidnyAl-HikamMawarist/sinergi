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
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#EBF5F0] border border-[#287D5A]/30 text-[#287D5A] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#287D5A] shrink-0" />
                        <span className="text-xs font-semibold">{flash.success}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#287D5A] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.error && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#FDF2F2] border border-[#C24141]/30 text-[#C24141] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0" />
                        <span className="text-xs font-semibold">{flash.error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#C24141] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.warning && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#FEF8EC] border border-[#B7791F]/30 text-[#B7791F] shadow-xs">
                    <div className="flex items-center space-x-2.5">
                        <AlertTriangle className="w-4 h-4 text-[#B7791F] shrink-0" />
                        <span className="text-xs font-semibold">{flash.warning}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-[#B7791F] hover:opacity-75 p-0.5 rounded-md"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
