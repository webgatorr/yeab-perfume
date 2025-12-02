'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
    Search,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Loader2,
    Eye,
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

const UAE_EMIRATES = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
];

function OrdersContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        emirate: '',
        orderTaker: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status, router, searchParams, currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '10');

            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.emirate) params.append('emirate', filters.emirate);
            if (filters.orderTaker) params.append('orderTaker', filters.orderTaker);

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            setOrders(data.orders);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchOrders();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchOrders();
            } else {
                alert('Failed to delete order');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
                        <p className="text-slate-500">Manage and track all perfume orders</p>
                    </div>
                    <Link href="/orders/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Order
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button variant="secondary" onClick={handleSearch}>
                            Search
                        </Button>
                    </div>

                    {showFilters && (
                        <Card className="bg-slate-50/50">
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Emirate</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.emirate}
                                        onChange={(e) => setFilters({ ...filters, emirate: e.target.value })}
                                    >
                                        <option value="">All Emirates</option>
                                        {UAE_EMIRATES.map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Order Taker</Label>
                                    <Input
                                        type="text"
                                        placeholder="Order Taker name"
                                        value={filters.orderTaker}
                                        onChange={(e) => setFilters({ ...filters, orderTaker: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order: any) => (
                                        <TableRow
                                            key={order._id}
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/orders/${order._id}`)}
                                        >
                                            <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                                            <TableCell className="text-slate-500">
                                                {new Date(order.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.whatsappNumber}</div>
                                                <div className="text-xs text-slate-500">{order.emirate}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {order.perfumeChoice}
                                                <span className="ml-2 text-xs text-slate-400">x{order.amount}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors
                                                    ${order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                                        order.status === 'shipped' ? 'bg-yellow-50 text-yellow-700' :
                                                            order.status === 'processing' ? 'bg-purple-50 text-purple-700' :
                                                                order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                                                    'bg-blue-50 text-blue-700'}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Link href={`/orders/${order._id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/orders/${order._id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(order._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
