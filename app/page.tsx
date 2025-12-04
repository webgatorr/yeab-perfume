'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Plus, Search } from 'lucide-react';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const ordersRes = await fetch('/api/orders?limit=1000');
      const ordersData = await ordersRes.json();

      const orders = ordersData.orders || [];
      const pending = orders.filter((o: any) => o.status === 'pending').length;
      const completed = orders.filter((o: any) => o.status === 'delivered').length;

      setStats({
        totalOrders: orders.length,
        pendingOrders: pending,
        completedOrders: completed,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      href: '/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      href: '/orders?status=pending',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      href: '/orders?status=delivered',
    },
  ];

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

        {/* Order Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const iconColors = ['text-blue-600', 'text-yellow-600', 'text-green-600'];
              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-5 w-5 ${iconColors[index]}`} />
                </Link>
              );
            })}
          </div>
        </div>


        {/* Quick Actions */}
        <div>
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
      </main>
    </div>
  );
}
