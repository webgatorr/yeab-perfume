'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { toast } from 'sonner';
import { TransactionDetailModal } from '@/components/finances/TransactionDetailModal';
import { ExportDialog } from '@/components/shared/ExportDialog';
import { downloadCSV, downloadPDF } from '@/lib/exportUtils';
import {
    TrendingUp,
    TrendingDown,
    Loader2,
    Wallet,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Trash2,
    AlertTriangle
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FinancesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        type: 'income',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [clearStep, setClearStep] = useState(1);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Filter and pagination state
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    // Chart month/year selection
    const [chartMonth, setChartMonth] = useState(new Date().getMonth());
    const [chartYear, setChartYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchStats();
        }
    }, [status, router, chartMonth, chartYear]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTransactions = useCallback(async () => {
        if (status !== 'authenticated') return;

        setTransactionsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', '20');
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (typeFilter) params.set('type', typeFilter);
            if (startDate) {
                // Set start date to beginning of day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                params.set('startDate', start.toISOString());
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                params.set('endDate', end.toISOString());
            }

            const res = await fetch(`/api/transactions?${params.toString()}`);
            const data = await res.json();

            if (data.transactions) {
                setTransactions(data.transactions);
                setPagination(data.pagination);
            } else {
                setTransactions([]);
                setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setTransactionsLoading(false);
        }
    }, [status, currentPage, debouncedSearch, typeFilter, startDate, endDate]);

    // Refetch transactions when filters or page changes
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const fetchStats = async () => {
        try {
            const firstDay = new Date(chartYear, chartMonth, 1);
            const lastDay = new Date(chartYear, chartMonth + 1, 0);

            const statsRes = await fetch(`/api/transactions/stats?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`);
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToPreviousMonth = () => {
        if (chartMonth === 0) {
            setChartMonth(11);
            setChartYear(chartYear - 1);
        } else {
            setChartMonth(chartMonth - 1);
        }
    };

    const goToNextMonth = () => {
        const now = new Date();
        const isCurrentMonthCheck = chartMonth === now.getMonth() && chartYear === now.getFullYear();
        if (isCurrentMonthCheck) return; // Don't go beyond current month

        if (chartMonth === 11) {
            setChartMonth(0);
            setChartYear(chartYear + 1);
        } else {
            setChartMonth(chartMonth + 1);
        }
    };

    const isCurrentMonth = chartMonth === new Date().getMonth() && chartYear === new Date().getFullYear();
    const chartMonthName = new Date(chartYear, chartMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' });

    const handleClearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const handleExport = async (format: 'csv' | 'pdf', exportStartDate: string, exportEndDate: string) => {
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (typeFilter) params.set('type', typeFilter);

            // Use range from dialog
            params.set('startDate', new Date(exportStartDate).toISOString());
            const end = new Date(exportEndDate);
            end.setHours(23, 59, 59, 999);
            params.set('endDate', end.toISOString());

            params.set('limit', '10000');

            const res = await fetch(`/api/transactions?${params.toString()}`);
            const data = await res.json();

            if (!data.transactions || data.transactions.length === 0) {
                toast.error('No transactions found to export');
                return;
            }

            const exportData = data.transactions;
            const filename = `finances_${exportStartDate}_${exportEndDate}`;

            const columns = [
                { header: 'Date', key: 'date', formatter: (item: any) => new Date(item.date).toLocaleDateString() },
                { header: 'Type', key: 'type' },
                { header: 'Category', key: 'category' },
                { header: 'Description', key: 'description' },
                { header: 'Amount (AED)', key: 'amount' },
            ];

            if (format === 'csv') {
                downloadCSV(exportData, columns, filename);
            } else {
                downloadPDF(exportData, columns, 'Financial Report', filename);
            }

        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export transactions');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading('Adding transaction...');

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (res.ok) {
                toast.success('Transaction added successfully!', {
                    id: loadingToast,
                    description: 'Your financial record has been updated.',
                });
                setFormData({
                    type: 'income',
                    amount: '',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                });
                fetchStats();
                fetchTransactions();
            } else {
                const error = await res.json();
                toast.error('Failed to add transaction', {
                    id: loadingToast,
                    description: error.message || 'Please check your input and try again.',
                });
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error('An error occurred', {
                id: loadingToast,
                description: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        setDeleting(true);
        const loadingToast = toast.loading('Deleting transaction...');

        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Transaction deleted successfully', {
                    id: loadingToast,
                    description: 'The transaction has been removed.',
                });
                setIsModalOpen(false);
                setSelectedTransaction(null);
                fetchStats();
                fetchTransactions();
            } else {
                toast.error('Failed to delete transaction', {
                    id: loadingToast,
                    description: 'Please try again later.',
                });
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('An error occurred', {
                id: loadingToast,
                description: 'Please try again later.',
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleClearClick = () => {
        setClearStep(1);
        setDeleteConfirmation('');
        setShowClearDialog(true);
    };

    const handleClearSubmit = async () => {
        if (clearStep === 1) {
            setClearStep(2);
            return;
        }

        if (deleteConfirmation !== 'DELETE') return;

        setClearing(true);
        const loadingToast = toast.loading('Clearing all financial data...');

        try {
            const res = await fetch('/api/transactions', {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('All transactions cleared successfully', {
                    id: loadingToast,
                });
                setShowClearDialog(false);
                fetchStats();
                fetchTransactions();
            } else {
                toast.error('Failed to clear transactions', {
                    id: loadingToast,
                });
            }
        } catch (error) {
            console.error('Error clearing transactions:', error);
            toast.error('An error occurred', {
                id: loadingToast,
            });
        } finally {
            setClearing(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50/50">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finances</h1>
                        <p className="text-slate-500 mt-1">Track your income and expenses</p>
                    </div>
                    <div className="flex gap-2">
                        {session?.user?.role === 'admin' && (
                            <Button
                                variant="destructive"
                                onClick={handleClearClick}
                                disabled={clearing}
                                className="h-10 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Data
                            </Button>
                        )}
                        <ExportDialog
                            title="Export Finances"
                            description="Download financial data matching your current filters."
                            onExport={handleExport}
                        />
                    </div>
                </div>

                <main className="space-y-8">
                    {/* Stats Section */}
                    <div className="space-y-4">
                        {/* Month Selector */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToPreviousMonth}
                                    className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-500"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{chartMonthName}</h2>
                                    <p className="text-xs text-slate-500 font-medium">Financial Overview</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToNextMonth}
                                    disabled={isCurrentMonth}
                                    className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Stats Widgets */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income</p>
                                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                                        +{stats?.summary?.totalIncome?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense</p>
                                    <div className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">
                                        -{stats?.summary?.totalExpense?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                                    <TrendingDown className="h-6 w-6 text-rose-600" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
                                    <div className={`text-2xl sm:text-3xl font-bold mt-1 ${stats?.summary?.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                        {stats?.summary?.netProfit?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transaction List (Takes up 2/3 on large screens) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Transactions</h3>
                                            <p className="text-xs text-slate-500 font-medium">History & details</p>
                                        </div>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            <button
                                                onClick={() => { setTypeFilter(''); setCurrentPage(1); }}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!typeFilter ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => { setTypeFilter('income'); setCurrentPage(1); }}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                                            >
                                                Income
                                            </button>
                                            <button
                                                onClick={() => { setTypeFilter('expense'); setCurrentPage(1); }}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-rose-600'}`}
                                            >
                                                Expense
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                placeholder="Search transactions..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                                className="h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                                            />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                                className="h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Transactions List */}
                                <div className="divide-y divide-slate-100">
                                    {transactionsLoading ? (
                                        <div className="p-12 flex justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                                        </div>
                                    ) : transactions.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500 font-medium">
                                            No transactions found
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop Table Header */}
                                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                                <div className="col-span-3">Date</div>
                                                <div className="col-span-3">Category</div>
                                                <div className="col-span-4">Description</div>
                                                <div className="col-span-2 text-right">Amount</div>
                                            </div>

                                            {transactions.map((t: any) => (
                                                <div
                                                    key={t._id}
                                                    onClick={() => { setSelectedTransaction(t); setIsModalOpen(true); }}
                                                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                                                >
                                                    {/* Mobile View */}
                                                    <div className="md:hidden p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {t.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 text-sm">{t.category}</div>
                                                                <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                                {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                                                            </div>
                                                            {t.description && <div className="text-xs text-slate-400 max-w-[120px] truncate">{t.description}</div>}
                                                        </div>
                                                    </div>

                                                    {/* Desktop View */}
                                                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm">
                                                        <div className="col-span-3 text-slate-500 font-medium">
                                                            {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="col-span-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {t.category}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-4 text-slate-600 truncate">
                                                            {t.description || '-'}
                                                        </div>
                                                        <div className={`col-span-2 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                            {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Page {pagination.page} of {pagination.pages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={pagination.page === 1}
                                                className="h-8 w-8 p-0 rounded-lg"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                                disabled={pagination.page === pagination.pages}
                                                className="h-8 w-8 p-0 rounded-lg"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Transaction Form (Sticky on Desktop) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">New Transaction</h3>
                                    <p className="text-xs text-slate-500 font-medium">Record income or expense</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="bg-slate-50 p-1 rounded-xl grid grid-cols-2 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'income' })}
                                            className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Income
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                                            className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Expense
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (AED)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                            placeholder="0.00"
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all font-mono font-medium text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.type === 'income' ? ['Sales', 'Refund', 'Investment'] : ['Rent', 'Utilities', 'Food', 'Transport', 'Marketing', 'Inventory']).map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.category === cat
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                        <input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g. Monthly rent"
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all font-medium text-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full h-12 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                                            ${formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formData.type === 'income' ? 'Record Income' : 'Record Expense'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
                onDelete={handleDeleteTransaction}
                deleting={deleting}
            />

            {/* Clear Data Dialog */}
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Financial Data</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All transactions will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>

                    {clearStep === 1 ? (
                        <div className="py-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-900">Warning</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        You are about to delete all financial records. Are you sure you want to proceed?
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-slate-600">
                                To confirm, type <span className="font-bold text-slate-900">DELETE</span> below:
                            </p>
                            <Input
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="DELETE"
                                className="font-mono"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowClearDialog(false)}
                            disabled={clearing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearSubmit}
                            disabled={clearing || (clearStep === 2 && deleteConfirmation !== 'DELETE')}
                        >
                            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : clearStep === 1 ? 'Proceed' : 'Permanently Delete All'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
