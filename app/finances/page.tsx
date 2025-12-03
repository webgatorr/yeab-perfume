'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { TransactionDetailModal } from '@/components/finances/TransactionDetailModal';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Calendar,
    Tag,
    Loader2,
    Wallet
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    const fetchData = async () => {
        try {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const [statsRes, transactionsRes] = await Promise.all([
                fetch(`/api/transactions/stats?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`),
                fetch('/api/transactions?limit=10')
            ]);

            const statsData = await statsRes.json();
            const transactionsData = await transactionsRes.json();

            setStats(statsData);
            // API returns the array directly, or an object with error if failed
            if (Array.isArray(transactionsData)) {
                setTransactions(transactionsData);
            } else {
                console.error('Invalid transactions data:', transactionsData);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
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
                fetchData();
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
                fetchData();
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

                {/* Recent Transactions Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t: any) => (
                                <TableRow
                                    key={t._id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => {
                                        setSelectedTransaction(t);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <TableCell className="text-slate-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                            ${t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        {t.category}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {t.type === 'income' ? '+' : '-'} AED {t.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
    );
}
