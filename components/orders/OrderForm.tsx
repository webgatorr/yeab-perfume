'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Loader2,
    Calendar,
    Phone,
    User,
    Package,
    MapPin,
    FileText,
    Hash,
    Ticket,
    MessageSquare,
    DollarSign
} from 'lucide-react';

const UAE_EMIRATES = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
];

interface OrderFormProps {
    initialData?: any;
    orderId?: string;
}

export default function OrderForm({ initialData, orderId }: OrderFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        whatsappNumber: initialData?.whatsappNumber || '',
        hasCustomText: initialData?.hasCustomText || false,
        hasCustomImage: initialData?.hasCustomImage || false,
        customTextContent: initialData?.customTextContent || '',
        amount: initialData?.amount || 1,
        price: initialData?.price || '',
        perfumeChoice: initialData?.perfumeChoice || '',
        emirate: initialData?.emirate || '',
        area: initialData?.area || '',
        otherLocation: initialData?.otherLocation || '',
        directPhone: initialData?.directPhone || '',
        orderTaker: initialData?.orderTaker || '',
        receiptNumber: initialData?.receiptNumber || '',
        couponNumber: initialData?.couponNumber || '',
        status: initialData?.status || 'pending',
        notes: initialData?.notes || '',
    });

    // Auto-set order taker from session when creating new order
    useEffect(() => {
        if (!orderId && session?.user?.name && !formData.orderTaker) {
            setFormData(prev => ({ ...prev, orderTaker: session.user.name || '' }));
        }
    }, [session, orderId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading(orderId ? 'Updating order...' : 'Creating order...');

        try {
            const url = orderId ? `/api/orders/${orderId}` : '/api/orders';
            const method = orderId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(orderId ? 'Order updated successfully!' : 'Order created successfully!', {
                    id: loadingToast,
                    description: orderId ? 'The order has been updated.' : 'The order has been created.',
                });

                setTimeout(() => {
                    router.push('/orders');
                    router.refresh();
                }, 500);
            } else {
                const error = await response.json();
                toast.error('Failed to save order', {
                    id: loadingToast,
                    description: error.message || 'Please check your input and try again.',
                });
            }
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('An error occurred', {
                id: loadingToast,
                description: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
            <div className="card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Customer Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            WhatsApp Number *
                        </label>
                        <input
                            type="text"
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            placeholder="+971 50 123 4567"
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            Direct Phone
                        </label>
                        <input
                            type="text"
                            value={formData.directPhone}
                            onChange={(e) => setFormData({ ...formData, directPhone: e.target.value })}
                            placeholder="Any format"
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            Order Taker
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-sm flex items-center">
                                {formData.orderTaker || session?.user?.name || 'Loading...'}
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Auto-filled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Product Details</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-slate-500" />
                            Perfume Choice *
                        </label>
                        <input
                            type="text"
                            value={formData.perfumeChoice}
                            onChange={(e) => setFormData({ ...formData, perfumeChoice: e.target.value })}
                            placeholder=" "
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-slate-500" />
                                Quantity *
                            </label>
                            <input
                                type="text"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="1"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                Price (AED)
                            </label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Customization</label>
                            <div className="flex gap-4 h-10 items-center">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasCustomText}
                                            onChange={(e) => setFormData({ ...formData, hasCustomText: e.target.checked })}
                                            className="peer h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">በስም</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasCustomImage}
                                            onChange={(e) => setFormData({ ...formData, hasCustomImage: e.target.checked })}
                                            className="peer h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">በፎቶ</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {formData.hasCustomText && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-slate-500" />
                                Custom Text Content
                            </label>
                            <input
                                type="text"
                                value={formData.customTextContent}
                                onChange={(e) => setFormData({ ...formData, customTextContent: e.target.value })}
                                placeholder="Text to print on the perfume"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delivery Location */}
            <div className="card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Delivery Location</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            Emirate
                        </label>
                        <select
                            value={formData.emirate}
                            onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                            className="w-full"
                        >
                            <option value="">Select Emirate</option>
                            {UAE_EMIRATES.map((emirate) => (
                                <option key={emirate} value={emirate}>{emirate}</option>
                            ))}
                            <option value="other">Other (Outside UAE)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            Area
                        </label>
                        <input
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder="e.g., Downtown"
                            className="w-full"
                        />
                    </div>

                    {formData.emirate === 'other' && (
                        <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                Other Location
                            </label>
                            <input
                                type="text"
                                value={formData.otherLocation}
                                onChange={(e) => setFormData({ ...formData, otherLocation: e.target.value })}
                                placeholder="City/Country"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Additional Info</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5 text-slate-500" />
                            Receipt Number
                        </label>
                        <input
                            type="text"
                            value={formData.receiptNumber}
                            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                            placeholder=""
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5 text-slate-500" />
                            Coupon Number
                        </label>
                        <input
                            type="text"
                            value={formData.couponNumber}
                            onChange={(e) => setFormData({ ...formData, couponNumber: e.target.value })}
                            placeholder=" "
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Order Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full"
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any special instructions..."
                            className="w-full resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-outline h-10 px-6"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-10 px-8"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        orderId ? 'Update Order' : 'Create Order'
                    )}
                </button>
            </div>
        </form>
    );
}
