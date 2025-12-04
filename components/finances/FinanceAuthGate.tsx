'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
                            <Lock className="w-8 h-8 text-slate-700" />
                        </div>
                        <CardTitle className="text-2xl">Finance Access</CardTitle>
                        <CardDescription>
                            Enter your finance credentials to access this section
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="finance-username">Username</Label>
                                <Input
                                    id="finance-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter finance username"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="finance-password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="finance-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter finance password"
                                        required
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
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
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={authenticating}>
                                {authenticating ? 'Authenticating...' : 'Access Finances'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
