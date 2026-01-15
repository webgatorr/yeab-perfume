'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { Plus, Search, Sparkles } from 'lucide-react';
import FinancialDashboard from '@/components/dashboard/FinancialDashboard';
import OrderDashboard from '@/components/dashboard/OrderDashboard';
import { format } from 'date-fns';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500 text-sm animate-pulse">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const quickActions = [
    {
      title: 'New Order',
      description: 'Create order',
      icon: Plus,
      href: '/orders/new',
      color: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Search',
      description: 'Find orders',
      icon: Search,
      href: '/orders',
      color: 'bg-violet-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">


      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">
              {format(new Date(), 'EEEE, d MMMM')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {greeting}, {session.user.name?.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className={`w-24 h-24 ${action.textColor}`} />
                  </div>

                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Dashboards Wrapper */}
        <div className="space-y-10">
          <section>
            <OrderDashboard />
          </section>

          {session.user.role === 'admin' && (
            <section>
              <FinancialDashboard />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
