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
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-50 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Customer Details</h3>
                        <p className="text-xs text-slate-500 font-medium">Contact information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            WhatsApp Number *
                        </label>
                        <input
                            type="text"
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            placeholder="+971 50 123 4567"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            Direct Phone
                        </label>
                        <input
                            type="text"
                            value={formData.directPhone}
                            onChange={(e) => setFormData({ ...formData, directPhone: e.target.value })}
                            placeholder="Optional"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Order Taker
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-11 px-3 rounded-xl border border-slate-200 bg-slate-100/50 text-slate-500 text-sm font-medium flex items-center">
                                {formData.orderTaker || session?.user?.name || 'Loading...'}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-wide">Auto-filled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-50 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Product Details</h3>
                        <p className="text-xs text-slate-500 font-medium">Items and customization</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Perfume Choice *
                        </label>
                        <input
                            type="text"
                            value={formData.perfumeChoice}
                            onChange={(e) => setFormData({ ...formData, perfumeChoice: e.target.value })}
                            placeholder="e.g. Blue Channel"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-medium text-lg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5" />
                                Quantity *
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                placeholder="1"
                                className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-mono font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5" />
                                Price (AED)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-mono font-medium"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customization</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasCustomText}
                                        onChange={(e) => setFormData({ ...formData, hasCustomText: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">በስም</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasCustomImage}
                                        onChange={(e) => setFormData({ ...formData, hasCustomImage: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">በፎቶ</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {formData.hasCustomText && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 pl-4 border-l-2 border-indigo-100">
                            <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Custom Text Content
                            </label>
                            <input
                                type="text"
                                value={formData.customTextContent}
                                onChange={(e) => setFormData({ ...formData, customTextContent: e.target.value })}
                                placeholder="Text to print on the perfume"
                                className="w-full h-11 px-3 rounded-xl border-indigo-100 bg-indigo-50/30 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-indigo-900 font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delivery Location */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-50 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Delivery Location</h3>
                        <p className="text-xs text-slate-500 font-medium">Shipping address</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Emirate
                        </label>
                        <select
                            value={formData.emirate}
                            onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all"
                        >
                            <option value="">Select Emirate</option>
                            {UAE_EMIRATES.map((emirate) => (
                                <option key={emirate} value={emirate}>{emirate}</option>
                            ))}
                            <option value="other">Other (Outside UAE)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Area
                        </label>
                        <input
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder="e.g., Downtown"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-medium"
                        />
                    </div>

                    {formData.emirate === 'other' && (
                        <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                Other Location
                            </label>
                            <input
                                type="text"
                                value={formData.otherLocation}
                                onChange={(e) => setFormData({ ...formData, otherLocation: e.target.value })}
                                placeholder="City/Country"
                                className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-50 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Additional Info</h3>
                        <p className="text-xs text-slate-500 font-medium">Receipts & Notes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" />
                            Receipt Number
                        </label>
                        <input
                            type="text"
                            value={formData.receiptNumber}
                            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                            placeholder="Optional"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5" />
                            Coupon Number
                        </label>
                        <input
                            type="text"
                            value={formData.couponNumber}
                            onChange={(e) => setFormData({ ...formData, couponNumber: e.target.value })}
                            placeholder="Optional"
                            className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1 block">Order Status</label>
                        <div className="relative">
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-11 px-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all appearance-none"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any special instructions..."
                            className="w-full p-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-slate-900 transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="h-12 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
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
