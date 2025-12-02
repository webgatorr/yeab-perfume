'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
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
                setFormData({
                    type: 'income',
                    amount: '',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                });
                fetchData();
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
                    <p className="text-slate-500">Track income, expenses, and business growth</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                AED {stats?.summary?.totalIncome?.toLocaleString() || '0'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                AED {stats?.summary?.totalExpense?.toLocaleString() || '0'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Net Profit</CardTitle>
                            <Wallet className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
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
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-slate-900" />
                                <CardTitle>Add Transaction</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={formData.type === 'income' ? 'default' : 'secondary'}
                                            onClick={() => setFormData({ ...formData, type: 'income' })}
                                            className="w-full"
                                        >
                                            Income
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.type === 'expense' ? 'default' : 'secondary'}
                                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                                            className="w-full"
                                        >
                                            Expense
                                        </Button>
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
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `AED ${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#0f172a" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
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
                                <TableRow key={t._id}>
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
        </div>
    );
}
