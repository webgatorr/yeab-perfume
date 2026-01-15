'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

import {
    Loader2,
    ArrowLeft,
    Edit,
    Calendar,
    Phone,
    User,
    Package,
    MapPin,
    FileText,
    Hash,
    Ticket,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchOrder();
        }
    }, [status, router, id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                router.push('/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
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

    if (!session || !order) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'shipped':
                return <Package className="h-5 w-5 text-yellow-600" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-purple-600" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-blue-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'shipped':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'processing':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">


            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 space-y-4">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    #{order.orderNumber}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="capitalize">{order.status}</span>
                                </span>
                            </div>
                            <p className="text-slate-500 flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                Created on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <Link href={`/orders/${id}/edit`}>
                            <Button className="w-full sm:w-auto rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Customer Details</h3>
                                    <p className="text-xs text-slate-500 font-medium">Contact information</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <Phone className="h-3.5 w-3.5" />
                                        WhatsApp
                                    </div>
                                    <p className="text-slate-900 font-medium text-lg">{order.whatsappNumber}</p>
                                </div>

                                {order.directPhone && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <Phone className="h-3.5 w-3.5" />
                                            Direct Phone
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg">{order.directPhone}</p>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Order Date
                                    </div>
                                    <p className="text-slate-900 font-medium text-lg">
                                        {new Date(order.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <User className="h-3.5 w-3.5" />
                                        Order Taker
                                    </div>
                                    <div className="inline-flex px-3 py-1 rounded-lg bg-slate-50 text-slate-700 font-medium border border-slate-100">
                                        {order.orderTaker}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Product Details</h3>
                                    <p className="text-xs text-slate-500 font-medium">Items and customization</p>
                                </div>
                            </div>

                            <div className="space-y-6 mt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <Package className="h-3.5 w-3.5" />
                                            Perfume
                                        </div>
                                        <p className="text-slate-900 font-bold text-xl">{order.perfumeChoice}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                <Hash className="h-3.5 w-3.5" />
                                                Qty
                                            </div>
                                            <p className="text-slate-900 font-bold text-xl">x{order.amount}</p>
                                        </div>
                                        {order.price !== undefined && order.price !== null && (
                                            <div className="space-y-1 text-right">
                                                <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    Total
                                                </div>
                                                <p className="text-indigo-600 font-bold text-2xl">
                                                    {order.price.toLocaleString()} <span className="text-sm font-medium text-slate-500">AED</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(order.hasCustomText || order.hasCustomImage) && (
                                    <div className="space-y-4 pt-2">
                                        <p className="text-sm font-bold text-slate-900">Customization</p>
                                        <div className="flex flex-wrap gap-2">
                                            {order.hasCustomText && (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                                    በስም (Custom Text)
                                                </span>
                                            )}
                                            {order.hasCustomImage && (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-sm font-medium border border-pink-100">
                                                    በፎቶ (Custom Image)
                                                </span>
                                            )}
                                        </div>
                                        {order.hasCustomText && order.customTextContent && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Custom Text Content
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 italic">
                                                    "{order.customTextContent}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Location */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Delivery Location</h3>
                                    <p className="text-xs text-slate-500 font-medium">Shipping address</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {order.emirate && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Emirate
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg">{order.emirate}</p>
                                    </div>
                                )}

                                {order.area && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Area
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg">{order.area}</p>
                                    </div>
                                )}

                                {order.otherLocation && (
                                    <div className="md:col-span-2 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Other Location
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {order.otherLocation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Additional Info */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Additional Info</h3>
                                    <p className="text-xs text-slate-500 font-medium">Receipts & Notes</p>
                                </div>
                            </div>

                            <div className="space-y-6 mt-6">
                                {order.receiptNumber && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <Hash className="h-3.5 w-3.5" />
                                            Receipt Number
                                        </div>
                                        <div className="font-mono text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-700 break-all">
                                            {order.receiptNumber}
                                        </div>
                                    </div>
                                )}

                                {order.couponNumber && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <Ticket className="h-3.5 w-3.5" />
                                            Coupon Number
                                        </div>
                                        <div className="font-mono text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-700">
                                            {order.couponNumber}
                                        </div>
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            Notes
                                        </div>
                                        <p className="text-slate-700 bg-amber-50/50 p-4 rounded-xl text-sm leading-relaxed border border-amber-100">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Timeline</h3>
                                    <p className="text-xs text-slate-500 font-medium">Activity history</p>
                                </div>
                            </div>

                            <div className="space-y-0 mt-6 relative">
                                {/* Vertical connector line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

                                <div className="relative flex items-start gap-4 pb-6">
                                    <div className="h-6 w-6 rounded-full bg-slate-900 border-4 border-white z-10 shadow-sm"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">Order Created</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {order.updatedAt !== order.createdAt && (
                                    <div className="relative flex items-start gap-4">
                                        <div className="h-6 w-6 rounded-full bg-indigo-500 border-4 border-white z-10 shadow-sm"></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">Last Updated</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(order.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
