'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import FinancialDashboard from '@/components/dashboard/FinancialDashboard';
import OrderDashboard from '@/components/dashboard/OrderDashboard';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const quickActions = [
    {
      title: 'New Order',
      description: 'Create a new order',
      icon: Plus,
      href: '/orders/new',
    },
    {
      title: 'Search Orders',
      description: 'Find and manage orders',
      icon: Search,
      href: '/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            Dashboard
          </h1>
          <p className="text-slate-500">
            Overview of your business performance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center space-x-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <div className="p-2 bg-slate-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Icon className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{action.title}</p>
                    <p className="text-sm text-slate-500">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Overview (Admin Only) */}
        {session.user.role === 'admin' && (
          <div className="mb-8">
            <FinancialDashboard />
          </div>
        )}

        {/* Order Statistics (Visible to everyone) */}
        <div className="mb-8">
          <OrderDashboard />
        </div>
      </main>
    </div>
  );
}
