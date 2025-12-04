'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, Package, DollarSign, LogOut, Boxes } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session) return null;

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Orders', href: '/orders', icon: Package },
        { name: 'Inventory', href: '/inventory', icon: Boxes },
        { name: 'Finances', href: '/finances', icon: DollarSign },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">
                                Yeab Perfume
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:ml-10 md:space-x-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block text-sm font-medium text-slate-600">
                            {session.user?.name}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${isActive
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
