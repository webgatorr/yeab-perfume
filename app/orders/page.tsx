'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
    Download,
} from 'lucide-react';
import { ExportDialog } from '@/components/shared/ExportDialog';
import { downloadCSV, downloadPDF } from '@/lib/exportUtils';

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

    // Initialize state from URL params
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        emirate: searchParams.get('emirate') || '',
        orderTaker: searchParams.get('orderTaker') || '',
    });

    const [showFilters, setShowFilters] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null,
    });
    const [deleting, setDeleting] = useState(false);

    // Sync state with URL params when they change (e.g. back button)
    useEffect(() => {
        setCurrentPage(parseInt(searchParams.get('page') || '1'));
        setFilters({
            search: searchParams.get('search') || '',
            status: searchParams.get('status') || '',
            emirate: searchParams.get('emirate') || '',
            orderTaker: searchParams.get('orderTaker') || '',
        });
    }, [searchParams]);

    // Debounce search input to update URL
    useEffect(() => {
        const timer = setTimeout(() => {
            updateUrl(filters.search, filters.status, filters.emirate, filters.orderTaker, currentPage);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.search]);

    // Immediate update for other filters
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Reset to page 1 on filter change
        updateUrl(newFilters.search, newFilters.status, newFilters.emirate, newFilters.orderTaker, 1);
    };

    const updateUrl = (search: string, status: string, emirate: string, orderTaker: string, page: number) => {
        const params = new URLSearchParams();
        if (page > 1) params.append('page', page.toString());
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (emirate) params.append('emirate', emirate);
        if (orderTaker) params.append('orderTaker', orderTaker);

        // Only push if the URL is actually different to avoid duplicate history entries
        const currentString = searchParams.toString();
        const newString = params.toString();

        if (currentString !== newString) {
            router.push(`/orders?${newString}`);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        updateUrl(filters.search, filters.status, filters.emirate, filters.orderTaker, newPage);
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status, router, searchParams]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Always fetch based on current URL params
            const params = new URLSearchParams(searchParams.toString());
            if (!params.has('limit')) params.append('limit', '14');
            if (!params.has('page')) params.append('page', '1');

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            setOrders(data.orders);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders', {
                description: 'Please refresh the page to try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'pdf', startDate: string, endDate: string) => {
        try {
            // Build params based on current filters AND the date range from dialog
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.emirate) params.append('emirate', filters.emirate);
            if (filters.orderTaker) params.append('orderTaker', filters.orderTaker);

            // Add date range for export
            params.append('startDate', new Date(startDate).toISOString());
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            params.append('endDate', end.toISOString());

            // Get ALL matching records
            params.append('limit', '10000');

            const res = await fetch(`/api/orders?${params.toString()}`);
            const data = await res.json();

            if (!data.orders || data.orders.length === 0) {
                toast.error('No orders found to export');
                return;
            }

            const exportData = data.orders;
            const filename = `orders_${startDate}_${endDate}`;

            const columns = [
                { header: 'Order #', key: 'orderNumber' },
                { header: 'Date', key: 'date', formatter: (item: any) => new Date(item.date).toLocaleDateString() },
                { header: 'Customer', key: 'whatsappNumber' },
                { header: 'Perfume', key: 'perfumeChoice' },
                { header: 'Amount', key: 'amount' },
                { header: 'Price', key: 'price' },
                { header: 'Status', key: 'status' },
                { header: 'Emirate', key: 'emirate' },
                { header: 'Order Taker', key: 'orderTaker' },
            ];

            if (format === 'csv') {
                downloadCSV(exportData, columns, filename);
            } else {
                downloadPDF(exportData, columns, 'Orders Report', filename);
            }

        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export orders');
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.orderId) return;

        setDeleting(true);
        const loadingToast = toast.loading('Deleting order...');

        try {
            const res = await fetch(`/api/orders/${deleteDialog.orderId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Order deleted successfully', {
                    id: loadingToast,
                    description: 'The order has been removed from the system.',
                });
                setDeleteDialog({ isOpen: false, orderId: null });
                fetchOrders();
            } else {
                toast.error('Failed to delete order', {
                    id: loadingToast,
                    description: 'Please try again later.',
                });
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('An error occurred', {
                id: loadingToast,
                description: 'Please try again later.',
            });
        } finally {
            setDeleting(false);
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
                    <div className="flex gap-2">
                        <ExportDialog
                            title="Export Orders"
                            description="Download order data. The export will include orders matching your current filters within the selected date range."
                            onExport={handleExport}
                        />
                        <Link href="/orders/new">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Order
                            </Button>
                        </Link>
                    </div>
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
                            />
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
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
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
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
                                        onChange={(e) => handleFilterChange('emirate', e.target.value)}
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
                                        onChange={(e) => handleFilterChange('orderTaker', e.target.value)}
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
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
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
                                            <TableCell className="font-medium">
                                                {order.price ? `AED ${order.price.toLocaleString()}` : '-'}
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
                                                        onClick={() => setDeleteDialog({ isOpen: true, orderId: order._id })}
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
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, orderId: null })}
                onConfirm={handleDelete}
                title="Delete Order"
                description="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
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
