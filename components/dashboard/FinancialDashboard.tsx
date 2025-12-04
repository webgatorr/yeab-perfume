'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, Loader2, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

export default function FinancialDashboard() {
    const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date();
            let grouping = 'day';

            if (period === 'today') {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                grouping = 'day';
            } else if (period === 'week') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                startDate = new Date(now.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                grouping = 'day';
            } else if (period === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                grouping = 'day';
            } else if (period === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                grouping = 'month';
            }

            const res = await fetch(`/api/transactions/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&grouping=${grouping}`);
            const result = await res.json();

            // Process trends for chart
            const processedTrends = processTrends(result.trends, grouping);

            setData({ ...result, processedTrends });
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processTrends = (trends: any[], grouping: string) => {
        if (!trends) return [];

        const map = new Map();

        trends.forEach((item: any) => {
            const { year, month, day } = item._id;
            // Create a key based on grouping
            const key = grouping === 'day'
                ? `${year}-${month}-${day}`
                : `${year}-${month}`;

            const dateLabel = grouping === 'day'
                ? `${month}/${day}`
                : new Date(year, month - 1).toLocaleString('default', { month: 'short' });

            if (!map.has(key)) {
                map.set(key, { name: dateLabel, income: 0, expense: 0 });
            }

            const entry = map.get(key);
            if (item._id.type === 'income') {
                entry.income = item.total;
            } else {
                entry.expense = item.total;
            }
        });

        return Array.from(map.values());
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading && !data) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Financial Overview</h2>
                <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-4 sm:w-[400px]">
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            +AED {data?.summary?.totalIncome?.toLocaleString() || '0'}
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
                            -AED {data?.summary?.totalExpense?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data?.summary?.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            AED {data?.summary?.netProfit?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Bar Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Income vs Expense
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.processedTrends || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `AED ${value}`} />
                                    <Tooltip
                                        formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4" />
                            Top Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.categoryBreakdown
                                ?.filter((item: any) => item._id.type === 'expense')
                                .slice(0, 5)
                                .map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-sm font-medium">{item._id.category}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            AED {item.total.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            {(!data?.categoryBreakdown || data.categoryBreakdown.filter((i: any) => i._id.type === 'expense').length === 0) && (
                                <div className="text-center text-muted-foreground py-8">
                                    No expense data
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
