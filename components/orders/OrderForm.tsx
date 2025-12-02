'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        whatsappNumber: initialData?.whatsappNumber || '',
        hasCustomText: initialData?.hasCustomText || false,
        hasCustomImage: initialData?.hasCustomImage || false,
        customTextContent: initialData?.customTextContent || '',
        amount: initialData?.amount || 1,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = orderId ? `/api/orders/${orderId}` : '/api/orders';
            const method = orderId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/orders');
                router.refresh();
            } else {
                alert('Failed to save order');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">WhatsApp Number *</label>
                        <input
                            type="tel"
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            placeholder="+971 50 123 4567"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Direct Phone</label>
                        <input
                            type="tel"
                            value={formData.directPhone}
                            onChange={(e) => setFormData({ ...formData, directPhone: e.target.value })}
                            placeholder="+971 50 123 4567"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Order Taker *</label>
                        <input
                            type="text"
                            value={formData.orderTaker}
                            onChange={(e) => setFormData({ ...formData, orderTaker: e.target.value })}
                            placeholder="Staff Name"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium leading-none">Perfume Choice *</label>
                        <input
                            type="text"
                            value={formData.perfumeChoice}
                            onChange={(e) => setFormData({ ...formData, perfumeChoice: e.target.value })}
                            placeholder="e.g., Rose Oud"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Quantity *</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2 flex items-end pb-2">
                        <div className="flex gap-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasCustomText}
                                    onChange={(e) => setFormData({ ...formData, hasCustomText: e.target.checked })}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <span className="text-sm font-medium">Custom Text</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasCustomImage}
                                    onChange={(e) => setFormData({ ...formData, hasCustomImage: e.target.checked })}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <span className="text-sm font-medium">Custom Image</span>
                            </label>
                        </div>
                    </div>

                    {formData.hasCustomText && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium leading-none">Custom Text Content</label>
                            <input
                                type="text"
                                value={formData.customTextContent}
                                onChange={(e) => setFormData({ ...formData, customTextContent: e.target.value })}
                                placeholder="Text to print"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Delivery Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Emirate</label>
                        <select
                            value={formData.emirate}
                            onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                        >
                            <option value="">Select Emirate</option>
                            {UAE_EMIRATES.map((emirate) => (
                                <option key={emirate} value={emirate}>{emirate}</option>
                            ))}
                            <option value="other">Other (Outside UAE)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Area</label>
                        <input
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            placeholder="e.g., Downtown"
                        />
                    </div>

                    {formData.emirate === 'other' && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium leading-none">Other Location</label>
                            <input
                                type="text"
                                value={formData.otherLocation}
                                onChange={(e) => setFormData({ ...formData, otherLocation: e.target.value })}
                                placeholder="City/Country"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Additional Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Receipt Number</label>
                        <input
                            type="text"
                            value={formData.receiptNumber}
                            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                            placeholder="RCP-001"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Coupon Number</label>
                        <input
                            type="text"
                            value={formData.couponNumber}
                            onChange={(e) => setFormData({ ...formData, couponNumber: e.target.value })}
                            placeholder="CPN-123"
                        />
                    </div>

                    {orderId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium leading-none">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any special instructions..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-outline h-10 px-4"
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
