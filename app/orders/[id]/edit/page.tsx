'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import OrderForm from '@/components/orders/OrderForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState(null);
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

    if (!session) return null;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link href={`/orders/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Order Details
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Order</h1>
                    <p className="text-slate-500 mt-1">Update order details and information</p>
                </div>

                <OrderForm initialData={order} orderId={id} />
            </main>
        </div>
    );
}
