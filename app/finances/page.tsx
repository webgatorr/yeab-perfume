'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { TransactionDetailModal } from '@/components/finances/TransactionDetailModal';
import FinanceAuthGate from '@/components/finances/FinanceAuthGate';
import {
    TrendingUp,
    TrendingDown,
    Loader2,
    Wallet,
    Search,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

    const goToCurrentMonth = () => {
        const now = new Date();
        setChartMonth(now.getMonth());
        setChartYear(now.getFullYear());
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

    const setDatePreset = (preset: 'today' | 'week' | 'month') => {
        const today = new Date();
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                setStartDate(formatDate(today));
                setEndDate(formatDate(today));
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                setStartDate(formatDate(weekStart));
                setEndDate(formatDate(today));
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(formatDate(monthStart));
                setEndDate(formatDate(today));
                break;
        }
        setCurrentPage(1);
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

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!session) return null;



    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finances</h1>
                    <p className="text-slate-500">Track your income and expenses</p>
                </div>

                <main className="space-y-8">
                    {/* Stats Cards with Month Selector */}
                    <div className="space-y-4">
                        {/* Month Selector */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">{chartMonthName}</h2>
                                <p className="text-sm text-muted-foreground">Financial summary for the selected month</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={goToPreviousMonth}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToCurrentMonth}
                                    disabled={isCurrentMonth}
                                    className="text-xs"
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={goToNextMonth}
                                    disabled={isCurrentMonth}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        +AED {stats?.summary?.totalIncome?.toLocaleString() || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        -AED {stats?.summary?.totalExpense?.toLocaleString() || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                    <Wallet className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${stats?.summary?.netProfit && stats.summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        AED {stats?.summary?.netProfit?.toLocaleString() || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Add Transaction Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add Transaction Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={formData.type === 'income' ? 'default' : 'outline'}
                                                    className={`flex-1 ${formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                    onClick={() => setFormData({ ...formData, type: 'income' })}
                                                >
                                                    Income
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                                                    className={`flex-1 ${formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                                                >
                                                    Expense
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (AED)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                required
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {/* Assuming INCOME_CATEGORIES and EXPENSE_CATEGORIES are defined elsewhere */}
                                            {/* For now, using a placeholder array */}
                                            {(formData.type === 'income' ? ['Sales', 'Refund', 'Investment'] : ['Rent', 'Utilities', 'Food', 'Transport']).map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                    className={`px-3 py-2 text-sm rounded-md border transition-all ${formData.category === cat
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Optional description..."
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Transaction'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions Section with Filters */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <CardTitle>Transactions</CardTitle>

                                    {/* Type Filter - Tabs */}
                                    <Tabs
                                        value={typeFilter || 'all'}
                                        onValueChange={(value) => {
                                            setTypeFilter(value === 'all' ? '' : value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <TabsList>
                                            <TabsTrigger value="all">All</TabsTrigger>
                                            <TabsTrigger value="income" className="data-[state=active]:text-green-600">Income</TabsTrigger>
                                            <TabsTrigger value="expense" className="data-[state=active]:text-red-600">Expense</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Filters Row */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search category or description..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Date Preset Select */}
                                    <Select
                                        value={startDate && endDate ? 'custom' : ''}
                                        onValueChange={(value) => {
                                            if (value === 'today') setDatePreset('today');
                                            else if (value === 'week') setDatePreset('week');
                                            else if (value === 'month') setDatePreset('month');
                                            else if (value === 'all') {
                                                setStartDate('');
                                                setEndDate('');
                                                setCurrentPage(1);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This week</SelectItem>
                                            <SelectItem value="month">This month</SelectItem>
                                            {(startDate || endDate) && <SelectItem value="custom">Custom</SelectItem>}
                                        </SelectContent>
                                    </Select>

                                    {/* Date Inputs */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-[140px]"
                                        />
                                        <span className="text-muted-foreground text-sm">to</span>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-[140px]"
                                        />
                                    </div>

                                    {/* Clear Filters */}
                                    {(search || typeFilter || startDate || endDate) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleClearFilters}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {/* Results info */}
                                <div className="text-sm text-muted-foreground">
                                    Showing {transactions.length} of {pagination.total} transactions
                                    {(search || typeFilter || startDate || endDate) && ' (filtered)'}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Transactions Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="hidden sm:table-cell">Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No transactions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((t: any) => (
                                            <TableRow
                                                key={t._id}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedTransaction(t);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(t.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                                    ${t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {t.category}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                                                    {t.description}
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'} AED {t.amount.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Page {pagination.page} of {pagination.pages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                            disabled={currentPage === pagination.pages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>

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
            </div>
        </div>
    );
}
