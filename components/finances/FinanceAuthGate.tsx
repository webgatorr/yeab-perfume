'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinanceAuthGateProps {
    children: React.ReactNode;
}

const FINANCE_AUTH_KEY = 'finance_auth_token';
const FINANCE_AUTH_EXPIRY = 'finance_auth_expiry';
// Session expires after 1 hour
const SESSION_DURATION = 60 * 60 * 1000;

export default function FinanceAuthGate({ children }: FinanceAuthGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [authenticating, setAuthenticating] = useState(false);

    useEffect(() => {
        // Check if user has a valid session
        const token = sessionStorage.getItem(FINANCE_AUTH_KEY);
        const expiry = sessionStorage.getItem(FINANCE_AUTH_EXPIRY);

        if (token && expiry) {
            const expiryTime = parseInt(expiry);
            if (Date.now() < expiryTime) {
                setIsAuthenticated(true);
            } else {
                // Session expired, clear it
                sessionStorage.removeItem(FINANCE_AUTH_KEY);
                sessionStorage.removeItem(FINANCE_AUTH_EXPIRY);
            }
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAuthenticating(true);

        try {
            const res = await fetch('/api/finance-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store auth in session storage (cleared when browser closes)
                sessionStorage.setItem(FINANCE_AUTH_KEY, 'authenticated');
                sessionStorage.setItem(FINANCE_AUTH_EXPIRY, (Date.now() + SESSION_DURATION).toString());
                setIsAuthenticated(true);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        } finally {
            setAuthenticating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                        <div className="mx-auto mb-4 h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                            <Lock className="w-8 h-8 text-slate-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Finance Access</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Enter your finance credentials to access this section
                        </p>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter finance username"
                                    required
                                    autoComplete="off"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter finance password"
                                        required
                                        autoComplete="off"
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
                                disabled={authenticating}
                            >
                                {authenticating ? 'Authenticating...' : 'Access Finances'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
