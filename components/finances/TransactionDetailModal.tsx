'use client';

import { X, Calendar, DollarSign, Tag, FileText, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
    _id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
    createdBy: string;
    createdAt: string;
}

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onDelete: (id: string) => void;
    deleting?: boolean;
}

export function TransactionDetailModal({
    isOpen,
    onClose,
    transaction,
    onDelete,
    deleting = false,
}: TransactionDetailModalProps) {
    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Transaction Details</h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {transaction.type === 'income' ? 'Income' : 'Expense'} Record
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Amount Banner */}
                    <div className={`flex items-center gap-4 p-5 rounded-2xl border ${transaction.type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-rose-600 shadow-sm'}`}>
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>Amount</p>
                            <p className={`text-3xl font-bold ${transaction.type === 'income' ? 'text-emerald-900' : 'text-rose-900'}`}>
                                {transaction.type === 'income' ? '+' : '-'} AED {transaction.amount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Category */}
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</p>
                                <p className="font-semibold text-slate-900">{transaction.category}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                <p className="font-semibold text-slate-900">
                                    {new Date(transaction.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</p>
                                <p className="font-medium text-slate-900 break-words">
                                    {transaction.description || <span className="text-slate-400 italic">No description provided</span>}
                                </p>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recorded By</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-slate-900">{transaction.createdBy}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-2 bg-white">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-slate-600 font-semibold border-slate-200 hover:bg-slate-50"
                        disabled={deleting}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => onDelete(transaction._id)}
                        disabled={deleting}
                        className="flex-1 h-12 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 border border-red-100 shadow-sm"
                    >
                        <Trash2 className="h-5 w-5 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete Record'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
