'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Loader2,
    Plus,
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                            <p className="text-slate-500">Manage your staff and system settings</p>
                        </div>
                    </div>
                </div>

                {/* Staff Management Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-slate-900" />
                            </div>
                            <div>
                                <CardTitle>Staff Management</CardTitle>
                                <CardDescription>Add and manage order takers</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                Show inactive
                            </label>
                            <Button onClick={openCreateModal}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>No staff members yet.</p>
                                <p className="text-sm">Click "Add Staff" to create your first team member.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${user.isActive
                                                ? 'bg-white border-slate-200'
                                                : 'bg-slate-50 border-slate-200 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'admin'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                {user.role === 'admin' ? (
                                                    <ShieldCheck className="h-5 w-5" />
                                                ) : (
                                                    <Shield className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900">{user.name}</span>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-slate-100 text-slate-700'
                                                            }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                    {!user.isActive && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-500">@{user.username}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEditModal(user)}
                                                title="Edit user"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 ${user.isActive
                                                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                    }`}
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
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    </CardContent>
                </Card>
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowModal(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value.toLowerCase() })
                                    }
                                    placeholder="johndoe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required={!editingUser}
                                    />
                                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })
                                    }
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="staff">Staff (Order Taker)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : editingUser ? (
                                        'Update'
                                    ) : (
                                        'Create'
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
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
