'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle, XCircle, Loader2, BarChart3, MapPin } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { subDays } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderDashboard() {
    const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year', 'custom'
    const [customDateRange, setCustomDateRange] = useState({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    // Calculate dates based on period
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
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
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

    // Use SWR for fetching
    const { data: rawData, isLoading, isValidating } = useSWR(
        `/api/orders/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&grouping=${grouping}`,
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
            const key = grouping === 'day'
                ? `${year}-${month}-${day}`
                : `${year}-${month}`;

            const dateLabel = grouping === 'day'
                ? `${month}/${day}`
                : new Date(year, month - 1).toLocaleString('default', { month: 'short' });

            if (!map.has(key)) {
                map.set(key, { name: dateLabel, orders: 0, revenue: 0 });
            }

            const entry = map.get(key);
            entry.orders = item.count;
            entry.revenue = item.revenue;
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

    const STATUS_COLORS = {
        pending: '#EAB308',   // Yellow
        delivered: '#16A34A', // Green
        canceled: '#DC2626',  // Red
    };

    const LOCATION_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    if (isLoading && !data) {
        return (
            <div className="flex justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px] items-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-slate-500 font-medium">Loading statistics...</p>
                </div>
            </div>
        );
    }

    // Prepare data for status pie chart
    const statusData = [
        { name: 'Pending', value: data?.summary?.pendingOrders || 0, color: STATUS_COLORS.pending },
        { name: 'Delivered', value: data?.summary?.deliveredOrders || 0, color: STATUS_COLORS.delivered },
        { name: 'Canceled', value: data?.summary?.canceledOrders || 0, color: STATUS_COLORS.canceled },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order Statistics</h2>
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
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100/80 rounded-full">
                            <Package className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="text-sm font-semibold text-blue-900/70">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 tracking-tight">
                        {data?.summary?.totalOrders?.toLocaleString() || '0'}
                    </div>
                </div>

                <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-100/80 rounded-full">
                            <Clock className="h-4 w-4 text-amber-700" />
                        </div>
                        <span className="text-sm font-semibold text-amber-900/70">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-900 tracking-tight">
                        {data?.summary?.pendingOrders?.toLocaleString() || '0'}
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100/80 rounded-full">
                            <CheckCircle className="h-4 w-4 text-emerald-700" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-900/70">Delivered</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 tracking-tight">
                        {data?.summary?.deliveredOrders?.toLocaleString() || '0'}
                    </div>
                </div>

                <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100/50 space-y-3 transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100/80 rounded-full">
                            <XCircle className="h-4 w-4 text-rose-700" />
                        </div>
                        <span className="text-sm font-semibold text-rose-900/70">Canceled</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-900 tracking-tight">
                        {data?.summary?.canceledOrders?.toLocaleString() || '0'}
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
                {/* Main Trend Chart */}
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
                            <h3 className="font-semibold text-slate-900">Order Volume</h3>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.processedTrends || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
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
                                    tick={{ fill: '#64748b' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-800">
                                                    <p className="font-semibold mb-1 border-b border-slate-700 pb-1">{label}</p>
                                                    <p className="flex justify-between gap-4">
                                                        <span className="text-blue-400">Orders:</span>
                                                        <span className="font-mono">{payload[0].value?.toLocaleString()}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="orders" name="Orders" fill="url(#ordersGradient)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                    {isValidating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <PieChart className="h-4 w-4 text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Status Distribution</h3>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 gap-6 transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
                {/* Locations */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                    {isValidating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Orders by Location</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.locationStats?.slice(0, 7) || []} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis dataKey="_id" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#0f172a', fontWeight: 500 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" name="Orders" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data?.locationStats?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
