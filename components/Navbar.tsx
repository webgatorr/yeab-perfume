'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, Package, DollarSign, LogOut, Boxes, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session) return null;

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Orders', href: '/orders', icon: Package },
    ];

    if (session.user.role === 'admin') {
        navigation.push(
            { name: 'Inventory', href: '/inventory', icon: Boxes },
            { name: 'Finances', href: '/finances', icon: DollarSign },
            { name: 'Settings', href: '/settings', icon: Settings }
        );
    }

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-3 group active:scale-95 transition-transform duration-200" onClick={() => setMobileMenuOpen(false)}>
                            <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-lg shadow-slate-200 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                Yeab Perfume
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-1 items-center">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${isActive
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {session.user.role === 'admin' && (
                            <NotificationBell />
                        )}
                        <div className="hidden md:block text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {session.user?.name}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-300 ease-out shadow-xl absolute w-full z-40 rounded-b-3xl transform origin-top">
                    <div className="px-4 pt-3 pb-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-95 ${isActive
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <div className="pt-2 mt-2 border-t border-slate-100">
                            <div className="px-4 py-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {session.user?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{session.user?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{session.user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
