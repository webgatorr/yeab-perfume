'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { TransactionDetailModal } from '@/components/finances/TransactionDetailModal';
import FinanceAuthGate from '@/components/finances/FinanceAuthGate';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Tag,
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
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchStats();
        }
    }, [status, router]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Refetch transactions when filters or page changes
    useEffect(() => {
        if (status === 'authenticated') {
            fetchTransactions();
        }
    }, [debouncedSearch, typeFilter, startDate, endDate, currentPage]);

    const fetchStats = async () => {
        try {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const statsRes = await fetch(`/api/transactions/stats?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`);
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', '20');
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (typeFilter) params.set('type', typeFilter);
            if (startDate) params.set('startDate', new Date(startDate).toISOString());
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
    };

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

    const monthlyData = stats?.monthlyTrends?.reduce((acc: any[], item: any) => {
        const monthName = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en', { month: 'short' });
        const existing = acc.find(d => d.month === monthName);

        if (existing) {
            existing[item._id.type] = item.total;
        } else {
            acc.push({
                month: monthName,
                [item._id.type]: item.total,
            });
        }
        return acc;
    }, []) || [];

    const chartConfig = {
        income: {
            label: "Income",
            color: "#16a34a", // green-600
        },
        expense: {
            label: "Expense",
            color: "#dc2626", // red-600
        },
    } satisfies ChartConfig;

    return (
        <FinanceAuthGate>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
                        <p className="text-slate-500">Track income, expenses, and business growth</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium text-slate-500">Total Income</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-slate-900">
                                    AED {stats?.summary?.totalIncome?.toLocaleString() || '0'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium text-slate-500">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-slate-900">
                                    AED {stats?.summary?.totalExpense?.toLocaleString() || '0'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium text-slate-500">Net Profit</CardTitle>
                                <Wallet className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-slate-900">
                                    AED {stats?.summary?.netProfit?.toLocaleString() || '0'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Transaction Form */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Add Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setFormData({ ...formData, type: 'income' })}
                                                className={`cursor-pointer text-center p-2 rounded-md border transition-all ${formData.type === 'income'
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                Income
                                            </div>
                                            <div
                                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                                                className={`cursor-pointer text-center p-2 rounded-md border transition-all ${formData.type === 'expense'
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                Expense
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                type="number"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="!pl-10"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="!pl-10"
                                                placeholder="e.g., Sales"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g., Product sale, Rent payment"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="!pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Saving...' : 'Add Transaction'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Charts */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="h-[400px]">
                                <CardHeader>
                                    <CardTitle>Monthly Trends</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[320px]">
                                    <ChartContainer config={chartConfig} className="h-full w-full">
                                        <BarChart accessibilityLayer data={monthlyData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => value.slice(0, 3)}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                                            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
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
        </FinanceAuthGate>
    );
}
