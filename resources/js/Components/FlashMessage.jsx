import React from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = React.useState(false);

    React.useEffect(() => {
        setDismissed(false);
    }, [flash]);

    if (dismissed || (!flash?.success && !flash?.error && !flash?.warning)) {
        return null;
    }

    return (
        <div className="mb-6 space-y-2">
            {flash.success && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm animate-fade-in">
                    <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-emerald-500 hover:text-emerald-700 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.error && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm animate-fade-in">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {flash.warning && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm animate-fade-in">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span className="text-sm font-medium">{flash.warning}</span>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-amber-500 hover:text-amber-700 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
