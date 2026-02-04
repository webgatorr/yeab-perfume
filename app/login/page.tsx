'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
            {/* Back to home link */}
            <Link 
                href="/" 
                className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="text-2xl font-light tracking-[0.25em]">YEAB</div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="text-xs tracking-[0.2em] text-slate-500 uppercase">Perfume</div>
                        </div>
                        <h1 className="text-2xl font-light text-slate-900 mb-2">
                            Staff Portal
                        </h1>
                        <p className="text-sm text-slate-500">
                            Sign in to access the dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label 
                                htmlFor="username" 
                                className="block text-sm font-medium text-slate-700"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={loading}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                disabled={loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    Authorized personnel only
                </p>
            </div>
        </div>
    );
}
