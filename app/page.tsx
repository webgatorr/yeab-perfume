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


      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] shadow-xl shadow-indigo-100 overflow-hidden bg-white ring-1 ring-slate-100">
            <img src="/logo.png" alt="Yeab Perfume" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 tracking-tight">
              Yeab Perfume
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {greeting}, {session.user.name?.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 ${action.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-7 h-7 ${action.textColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{action.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">{action.description}</p>
                    </div>
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
