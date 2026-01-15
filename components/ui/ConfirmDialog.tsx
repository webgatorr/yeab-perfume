'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-3xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
                {/* Content */}
                <div className="p-6 text-center">
                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 mb-4 ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-xl text-slate-600 font-semibold border-slate-200 hover:bg-slate-50"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 h-12 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                            }`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
