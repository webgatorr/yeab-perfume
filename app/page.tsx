'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Package, Clock, CheckCircle, TrendingUp, TrendingDown, DollarSign, Plus, Search, FileText } from 'lucide-react';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
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
      const completed = orders.filter((o: any) => o.status === 'completed').length;

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const statsRes = await fetch(
        `/api/transactions/stats?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`
      );
      const statsData = await statsRes.json();

      setStats({
        totalOrders: orders.length,
        pendingOrders: pending,
        completedOrders: completed,
        monthlyIncome: statsData.summary?.totalIncome || 0,
        monthlyExpense: statsData.summary?.totalExpense || 0,
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
      href: '/orders?status=completed',
    },
    {
      title: 'Monthly Income',
      value: `AED ${stats.monthlyIncome.toLocaleString()}`,
      icon: TrendingUp,
      href: '/finances',
    },
    {
      title: 'Monthly Expense',
      value: `AED ${stats.monthlyExpense.toLocaleString()}`,
      icon: TrendingDown,
      href: '/finances',
    },
    {
      title: 'Net Profit',
      value: `AED ${(stats.monthlyIncome - stats.monthlyExpense).toLocaleString()}`,
      icon: DollarSign,
      href: '/finances',
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
      title: 'Add Transaction',
      description: 'Record income/expense',
      icon: FileText,
      href: '/finances',
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="card hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
              >
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-slate-500">
                    {stat.title}
                  </h3>
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
