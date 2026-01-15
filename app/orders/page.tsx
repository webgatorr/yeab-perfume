'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

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
                { header: 'Receipt #', key: 'receiptNumber' },
                { header: 'Date', key: 'date', formatter: (item: any) => new Date(item.date).toLocaleDateString() },
                { header: 'Status', key: 'status' },
                { header: 'Perfume', key: 'perfumeChoice' },
                { header: 'Amount', key: 'amount' },
                { header: 'Price', key: 'price' },
                { header: 'Whatsapp', key: 'whatsappNumber' },
                { header: 'Direct Phone', key: 'directPhone' },
                { header: 'Emirate', key: 'emirate' },
                { header: 'Area', key: 'area' },
                { header: 'Other Loc', key: 'otherLocation' },
                { header: 'Order Taker', key: 'orderTaker' },
                { header: 'Coupon', key: 'couponNumber' },
                { header: 'Notes', key: 'notes' },
                { header: 'Custom Text', key: 'customTextContent' },
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'shipped': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'processing': return 'bg-violet-100 text-violet-800 border-violet-200';
            case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50/50">


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
                        <p className="text-slate-500 font-medium">Manage and track your orders</p>
                    </div>
                    <div className="flex gap-3">
                        <ExportDialog
                            title="Export Orders"
                            description="Download order data. The export will include orders matching your current filters within the selected date range."
                            onExport={handleExport}
                        />
                        <Link href="/orders/new">
                            <Button className="rounded-xl shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300">
                                <Plus className="w-5 h-5 mr-2" />
                                New Order
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search by Order #, phone..."
                                className="pl-12 h-12 rounded-2xl border-0 shadow-sm bg-white ring-1 ring-slate-200 focus-visible:ring-indigo-500 transition-shadow"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 px-6 rounded-2xl border-0 shadow-sm ring-1 ring-slate-200 ${showFilters ? 'bg-slate-200' : 'bg-white'}`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 ml-1">Status</Label>
                                    <select
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                                    <Label className="text-slate-600 ml-1">Emirate</Label>
                                    <select
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                                    <Label className="text-slate-600 ml-1">Order Taker</Label>
                                    <Input
                                        type="text"
                                        placeholder="Name..."
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                                        value={filters.orderTaker}
                                        onChange={(e) => handleFilterChange('orderTaker', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700">Order #</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Product</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Price</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                    <TableHead className="text-right pr-6 font-semibold text-slate-700">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                            No orders found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order: any) => (
                                        <TableRow
                                            key={order._id}
                                            className="cursor-pointer hover:bg-slate-50/80 transition-colors border-slate-100"
                                            onClick={() => router.push(`/orders/${order._id}`)}
                                        >
                                            <TableCell className="font-bold text-slate-900 pl-6">#{order.orderNumber}</TableCell>
                                            <TableCell className="text-slate-500">
                                                {new Date(order.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{order.whatsappNumber}</div>
                                                <div className="text-xs text-slate-500">{order.emirate}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{order.perfumeChoice}</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium text-slate-600">x{order.amount}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-indigo-900">
                                                {order.price ? `AED ${order.price.toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${getStatusStyle(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <Link href={`/orders/${order._id}`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/orders/${order._id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
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

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-white rounded-3xl border border-slate-100">
                                No orders found.
                            </div>
                        ) : (
                            orders.map((order: any) => (
                                <div
                                    key={order._id}
                                    className="bg-white p-5 rounded-[1.25rem] shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
                                    onClick={() => router.push(`/orders/${order._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-medium text-slate-400 block mb-1">
                                                {new Date(order.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-lg font-bold text-slate-900">
                                                #{order.orderNumber}
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${getStatusStyle(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Customer</span>
                                            <span className="font-medium text-slate-900">{order.whatsappNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Product</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-slate-900">{order.perfumeChoice}</span>
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600">x{order.amount}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Emirate</span>
                                            <span className="font-medium text-slate-900">{order.emirate}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xl font-bold text-indigo-900">
                                            {order.price ? `AED ${order.price.toLocaleString()}` : '-'}
                                        </span>

                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/orders/${order._id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full">
                                                    <Edit className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                onClick={() => setDeleteDialog({ isOpen: true, orderId: order._id })}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center space-x-4 py-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-0 shadow-sm bg-white hover:bg-slate-50 text-slate-600"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl border-0 shadow-sm bg-white hover:bg-slate-50 text-slate-600"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-5 w-5" />
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
