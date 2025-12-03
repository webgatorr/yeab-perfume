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
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Transaction Details</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {transaction.type === 'income' ? 'Income' : 'Expense'} Transaction
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Amount */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            <DollarSign className={`h-5 w-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Amount</p>
                            <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {transaction.type === 'income' ? '+' : '-'} AED {transaction.amount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-start gap-3">
                        <Tag className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Category</p>
                            <p className="text-sm font-medium text-slate-900">{transaction.category}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Description</p>
                            <p className="text-sm text-slate-700">{transaction.description}</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Date</p>
                            <p className="text-sm font-medium text-slate-900">
                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Created By */}
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Created By</p>
                            <p className="text-sm font-medium text-slate-900">{transaction.createdBy}</p>
                        </div>
                    </div>

                    {/* Created At */}
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                            Created on {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={deleting}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => onDelete(transaction._id)}
                        disabled={deleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
