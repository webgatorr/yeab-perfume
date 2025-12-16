'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle, XCircle, Loader2, BarChart3, MapPin } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

export default function OrderDashboard() {
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
            }

            const res = await fetch(`/api/orders/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&grouping=${grouping}`);
            const result = await res.json();

            // Process trends for chart
            const processedTrends = processTrends(result.trends, grouping);

            setData({ ...result, processedTrends });
        } catch (error) {
            console.error('Error fetching order data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const STATUS_COLORS = {
        pending: '#EAB308',   // Yellow
        delivered: '#16A34A', // Green
        canceled: '#DC2626',  // Red
    };

    const LOCATION_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    if (loading && !data) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Order Statistics</h2>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                        <CardTitle className="text-base sm:text-sm font-medium truncate">Total</CardTitle>
                        <Package className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <div className="text-2xl font-bold text-blue-600 truncate">
                            {data?.summary?.totalOrders?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                        <CardTitle className="text-base sm:text-sm font-medium truncate">Pending</CardTitle>
                        <Clock className="h-5 w-5 sm:h-4 sm:w-4 text-json-600 text-yellow-600" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <div className="text-2xl font-bold text-yellow-600 truncate">
                            {data?.summary?.pendingOrders?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                        <CardTitle className="text-base sm:text-sm font-medium truncate">Delivered</CardTitle>
                        <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <div className="text-2xl font-bold text-green-600 truncate">
                            {data?.summary?.deliveredOrders?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                        <CardTitle className="text-base sm:text-sm font-medium truncate">Canceled</CardTitle>
                        <XCircle className="h-5 w-5 sm:h-4 sm:w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <div className="text-2xl font-bold text-red-600 truncate">
                            {data?.summary?.canceledOrders?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Order Volume
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.processedTrends || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
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
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Locations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            Orders by Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.locationStats?.slice(0, 7) || []} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="_id" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" name="Orders" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                                        {data?.locationStats?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
