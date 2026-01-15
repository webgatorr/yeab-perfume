'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Loader2,
    Edit,
    Trash2,
    UserPlus,
    Shield,
    ShieldCheck,
    UserX,
    UserCheck,
    Key,
    X,
    Users,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
    _id: string;
    username: string;
    name: string;
    email?: string;
    role: 'admin' | 'staff';
    isActive: boolean;
    createdAt: string;
}

interface UserFormData {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
}

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'staff',
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; userId: string | null }>({
        isOpen: false,
        userId: null,
    });
    const [deleting, setDeleting] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (session.user.role !== 'admin') {
                router.push('/');
                toast.error('Access denied', {
                    description: 'Only administrators can access settings.',
                });
            } else {
                fetchUsers();
            }
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/staff?includeInactive=${showInactive}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session.user.role === 'admin') {
            fetchUsers();
        }
    }, [showInactive]);

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            name: '',
            email: '',
            role: 'staff',
        });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            email: user.email || '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const loadingToast = toast.loading(editingUser ? 'Updating user...' : 'Creating user...');

        try {
            const url = editingUser ? `/api/staff/${editingUser._id}` : '/api/staff';
            const method = editingUser ? 'PUT' : 'POST';

            // Don't send empty password for updates
            const payload = { ...formData };
            if (editingUser && !payload.password) {
                delete (payload as any).password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingUser ? 'User updated!' : 'User created!', {
                    id: loadingToast,
                });
                setShowModal(false);
                fetchUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to save user', {
                    id: loadingToast,
                });
            }
        } catch (error) {
            toast.error('An error occurred', { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        const loadingToast = toast.loading(
            user.isActive ? 'Deactivating user...' : 'Activating user...'
        );

        try {
            const res = await fetch(`/api/staff/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive }),
            });

            if (res.ok) {
                toast.success(user.isActive ? 'User deactivated' : 'User activated', {
                    id: loadingToast,
                });
                fetchUsers();
            } else {
                toast.error('Failed to update user', { id: loadingToast });
            }
        } catch (error) {
            toast.error('An error occurred', { id: loadingToast });
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.userId) return;

        setDeleting(true);
        const loadingToast = toast.loading('Deleting user...');

        try {
            const res = await fetch(`/api/staff/${deleteDialog.userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('User deleted', { id: loadingToast });
                setDeleteDialog({ isOpen: false, userId: null });
                fetchUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to delete user', { id: loadingToast });
            }
        } catch (error) {
            toast.error('An error occurred', { id: loadingToast });
        } finally {
            setDeleting(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                        <p className="text-slate-500 mt-1">Manage staff and system preferences</p>
                    </div>
                </div>

                {/* Staff Management Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Staff Management</h2>
                                <p className="text-xs text-slate-500 font-medium">Manage team access & roles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Show Inactive
                            </label>
                            <Button onClick={openCreateModal} className="h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No staff members found</h3>
                                <p className="text-sm mt-1">Get started by adding a new staff member.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className={`group p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors ${!user.isActive ? 'bg-slate-50/30' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${user.role === 'admin'
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : 'bg-blue-50 text-blue-600'
                                                    } ${!user.isActive ? 'grayscale opacity-50' : ''}`}
                                            >
                                                {user.role === 'admin' ? (
                                                    <ShieldCheck className="h-6 w-6" />
                                                ) : (
                                                    <Shield className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-bold text-slate-900 ${!user.isActive ? 'text-slate-500' : ''}`}>{user.name}</span>
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${user.role === 'admin'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                    {!user.isActive && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-500 font-medium mt-0.5">@{user.username} • {user.email || 'No email'}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:border-slate-300 transition-all opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900"
                                                onClick={() => openEditModal(user)}
                                                title="Edit user"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:border-slate-300 transition-all opacity-0 group-hover:opacity-100 ${user.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                                onClick={() => handleToggleActive(user)}
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.isActive ? (
                                                    <UserX className="h-4 w-4" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 w-9 p-0 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => setDeleteDialog({ isOpen: true, userId: user._id })}
                                                title="Delete user"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingUser ? 'Edit Staff Member' : 'Add New Staff'}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    {editingUser ? 'Update user details' : 'Create an account for your team'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
                                onClick={() => setShowModal(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value.toLowerCase() })
                                    }
                                    placeholder="johndoe"
                                    required
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email (Optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {editingUser ? 'New Password (Optional)' : 'Password'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required={!editingUser}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium pr-10"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm pointer-events-none">
                                        <Key className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'staff' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'staff'
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <Shield className={`h-5 w-5 ${formData.role === 'staff' ? 'fill-blue-200' : ''}`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Staff</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'admin'
                                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <ShieldCheck className={`h-5 w-5 ${formData.role === 'admin' ? 'fill-amber-200' : ''}`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-12 rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : editingUser ? (
                                        'Update Staff'
                                    ) : (
                                        'Create Staff'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, userId: null })}
                onConfirm={handleDelete}
                title="Delete Staff Member"
                description="Are you sure you want to delete this user? This account will no longer be able to log in."
                confirmText="Delete Staff"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
