'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
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
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Created on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status}</span>
                            </div>
                            <Link href={`/orders/${id}/edit`}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Order
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Details */}
                        <div className="card">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Customer Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Phone className="h-3.5 w-3.5" />
                                        WhatsApp Number
                                    </div>
                                    <p className="text-slate-900 font-medium">{order.whatsappNumber}</p>
                                </div>

                                {order.directPhone && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Phone className="h-3.5 w-3.5" />
                                            Direct Phone
                                        </div>
                                        <p className="text-slate-900 font-medium">{order.directPhone}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Order Date
                                    </div>
                                    <p className="text-slate-900 font-medium">
                                        {new Date(order.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <User className="h-3.5 w-3.5" />
                                        Order Taker
                                    </div>
                                    <p className="text-slate-900 font-medium">{order.orderTaker}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="card">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-slate-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Product Details</h3>
                            </div>

                            <div className="space-y-6 mt-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Package className="h-3.5 w-3.5" />
                                        Perfume Choice
                                    </div>
                                    <p className="text-slate-900 font-medium text-lg">{order.perfumeChoice}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Hash className="h-3.5 w-3.5" />
                                            Quantity
                                        </div>
                                        <p className="text-slate-900 font-medium">{order.amount}</p>
                                    </div>

                                    {order.price !== undefined && order.price !== null && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Price
                                            </div>
                                            <p className="text-slate-900 font-semibold text-lg">AED {order.price.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    )}
                                </div>

                                {(order.hasCustomText || order.hasCustomImage) && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                        <p className="text-sm font-medium text-slate-700">Customization</p>
                                        <div className="flex flex-wrap gap-2">
                                            {order.hasCustomText && (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 text-slate-900 text-sm font-medium">
                                                    በስም (Custom Text)
                                                </span>
                                            )}
                                            {order.hasCustomImage && (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 text-slate-900 text-sm font-medium">
                                                    በፎቶ (Custom Image)
                                                </span>
                                            )}
                                        </div>
                                        {order.hasCustomText && order.customTextContent && (
                                            <div className="space-y-1 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Custom Text Content
                                                </div>
                                                <p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-md">
                                                    {order.customTextContent}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Location */}
                        <div className="card">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-slate-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Delivery Location</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {order.emirate && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Emirate
                                        </div>
                                        <p className="text-slate-900 font-medium">{order.emirate}</p>
                                    </div>
                                )}

                                {order.area && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Area
                                        </div>
                                        <p className="text-slate-900 font-medium">{order.area}</p>
                                    </div>
                                )}

                                {order.otherLocation && (
                                    <div className="md:col-span-2 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Other Location
                                        </div>
                                        <p className="text-slate-900 font-medium">{order.otherLocation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Additional Info */}
                        <div className="card">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-slate-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Additional Info</h3>
                            </div>

                            <div className="space-y-4 mt-4">
                                {order.receiptNumber && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Hash className="h-3.5 w-3.5" />
                                            Receipt Number
                                        </div>
                                        <p className="text-slate-900 font-medium font-mono text-sm bg-slate-50 px-2 py-1 rounded">
                                            {order.receiptNumber}
                                        </p>
                                    </div>
                                )}

                                {order.couponNumber && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Ticket className="h-3.5 w-3.5" />
                                            Coupon Number
                                        </div>
                                        <p className="text-slate-900 font-medium font-mono text-sm bg-slate-50 px-2 py-1 rounded">
                                            {order.couponNumber}
                                        </p>
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            Notes
                                        </div>
                                        <p className="text-slate-900 bg-slate-50 p-3 rounded-md text-sm leading-relaxed">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="card">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
                            </div>

                            <div className="space-y-3 mt-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-slate-900 mt-1.5"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">Order Created</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {order.updatedAt !== order.createdAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-slate-400 mt-1.5"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">Last Updated</p>
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
