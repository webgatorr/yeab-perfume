'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, Loader2, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { subDays } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FinancialDashboard() {
    const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year', 'custom'
    const [customDateRange, setCustomDateRange] = useState({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const { startDate, endDate, grouping } = useMemo(() => {
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
        } else if (period === 'custom') {
            startDate = new Date(customDateRange.from);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customDateRange.to);
            endDate.setHours(23, 59, 59, 999);
            // Determine grouping based on date range span
            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            grouping = daysDiff > 60 ? 'month' : 'day';
        }

        return { startDate, endDate, grouping };
    }, [period, customDateRange]);

    const { data: rawData, isLoading, isValidating } = useSWR(
        `/api/transactions/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&grouping=${grouping}`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
        }
    );

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

    const data = useMemo(() => {
        if (!rawData) return null;
        return {
            ...rawData,
            processedTrends: processTrends(rawData.trends, grouping)
        };
    }, [rawData, grouping]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (isLoading && !data) {
        return (
            <div className="flex justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px] items-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-slate-500 font-medium">Loading finances...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
                    {isValidating && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-medium">Updating...</span>
                        </div>
                    )}
                </div>
                <Tabs value={period} onValueChange={setPeriod} className="w-full">
                    <TabsList className="w-full grid grid-cols-5 bg-slate-100 p-1 rounded-xl h-12">
                        <TabsTrigger value="today" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200">Today</TabsTrigger>
                        <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200">Week</TabsTrigger>
                        <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200">Month</TabsTrigger>
                        <TabsTrigger value="year" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200">Year</TabsTrigger>
                        <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200">Custom</TabsTrigger>
                    </TabsList>
                </Tabs>
                {period === 'custom' && (
                    <DateRangePicker
                        dateRange={customDateRange}
                        onDateRangeChange={setCustomDateRange}
                    />
                )}
            </div>

            {/* Summary Cards */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100/80 rounded-full">
                            <TrendingUp className="h-4 w-4 text-emerald-700" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-900/70">Income</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 tracking-tight">
                        {data?.summary?.totalIncome > 0 ? '+' : ''}{data?.summary?.totalIncome?.toLocaleString() || '0'}
                    </div>
                </div>

                <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100/80 rounded-full">
                            <TrendingDown className="h-4 w-4 text-rose-700" />
                        </div>
                        <span className="text-sm font-semibold text-rose-900/70">Expense</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-900 tracking-tight">
                        {data?.summary?.totalExpense > 0 ? '-' : ''}{data?.summary?.totalExpense?.toLocaleString() || '0'}
                    </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100/80 rounded-full">
                            <Wallet className="h-4 w-4 text-indigo-700" />
                        </div>
                        <span className="text-sm font-semibold text-indigo-900/70">Net Profit</span>
                    </div>
                    <div className={`text-2xl font-bold tracking-tight ${data?.summary?.netProfit >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
                        {data?.summary?.netProfit?.toLocaleString() || '0'}
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
                {/* Main Bar Chart */}
                <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                    {isValidating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <BarChart3 className="h-4 w-4 text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Flow Analysis</h3>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.processedTrends || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    tick={{ fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-800">
                                                    <p className="font-semibold mb-1 border-b border-slate-700 pb-1">{label}</p>
                                                    <div className="space-y-1">
                                                        <p className="flex justify-between gap-4">
                                                            <span className="text-emerald-400">Income:</span>
                                                            <span className="font-mono">{payload[0].value?.toLocaleString()}</span>
                                                        </p>
                                                        <p className="flex justify-between gap-4">
                                                            <span className="text-rose-400">Expense:</span>
                                                            <span className="font-mono">{payload[1].value?.toLocaleString()}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Expense" fill="url(#expenseGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                    {isValidating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <PieChartIcon className="h-4 w-4 text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Top Expenses</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data?.categoryBreakdown
                            ?.filter((item: any) => item._id.type === 'expense')
                            .slice(0, 5)
                            .map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item._id.category}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {item.total.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        {(!data?.categoryBreakdown || data.categoryBreakdown.filter((i: any) => i._id.type === 'expense').length === 0) && (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                                <div className="p-3 bg-slate-50 rounded-full">
                                    <PieChartIcon className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium">No expenses recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
