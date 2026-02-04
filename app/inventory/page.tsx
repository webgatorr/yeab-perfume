'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { toast } from 'sonner';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    Loader2,
    X,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Perfume {
    _id: string;
    name: string;
    description?: string;
    currentStock: number;
    minStockLevel: number;
    unit: 'g' | 'kg';
    displayStock: number;
    isLowStock: boolean;
    category?: string;
    supplier?: string;
    costPerGram?: number;
    isActive: boolean;
}

interface Shipment {
    _id: string;
    perfume: { _id: string; name: string; unit: string };
    type: 'incoming' | 'outgoing' | 'adjustment';
    quantity: number;
    inputUnit: string;
    inputQuantity: number;
    totalCost?: number;
    supplier?: string;
    notes?: string;
    date: string;
    createdBy: string;
}

export default function InventoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [showAddPerfume, setShowAddPerfume] = useState(false);
    const [showAddShipment, setShowAddShipment] = useState(false);

    // Add Perfume Form
    const [perfumeForm, setPerfumeForm] = useState({
        name: '',
        description: '',
        unit: 'g',
        minStockLevel: 100,
        category: '',
        supplier: '',
    });

    // Add Shipment Form
    const [shipmentForm, setShipmentForm] = useState({
        perfumeId: '',
        type: 'incoming' as 'incoming' | 'outgoing' | 'adjustment',
        inputQuantity: '',
        inputUnit: 'g',
        costPerUnit: '',
        supplier: '',
        notes: '',
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (session?.user?.role !== 'admin') {
                router.push('/dashboard');
                toast.error('Unauthorized access');
                return;
            }
            fetchPerfumes();
            fetchRecentShipments();
        }
    }, [status, router, session]);

    const fetchPerfumes = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (stockFilter === 'low') params.set('lowStock', 'true');
            params.set('isActive', 'true');

            const res = await fetch(`/api/inventory?${params.toString()}`);
            const data = await res.json();
            setPerfumes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching perfumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentShipments = async () => {
        try {
            const res = await fetch('/api/shipments?limit=10');
            const data = await res.json();
            setShipments(data.shipments || []);
        } catch (error) {
            console.error('Error fetching shipments:', error);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            const timer = setTimeout(() => {
                fetchPerfumes();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [search, stockFilter]);

    const handleAddPerfume = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(perfumeForm),
            });

            if (res.ok) {
                toast.success('Perfume added successfully');
                setPerfumeForm({
                    name: '',
                    description: '',
                    unit: 'g',
                    minStockLevel: 100,
                    category: '',
                    supplier: '',
                });
                setShowAddPerfume(false);
                fetchPerfumes();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to add perfume');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddShipment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...shipmentForm,
                    inputQuantity: parseFloat(shipmentForm.inputQuantity),
                    costPerUnit: shipmentForm.costPerUnit ? parseFloat(shipmentForm.costPerUnit) : undefined,
                }),
            });

            if (res.ok) {
                toast.success(
                    shipmentForm.type === 'incoming'
                        ? 'Stock added successfully'
                        : shipmentForm.type === 'outgoing'
                            ? 'Stock removed successfully'
                            : 'Stock adjusted successfully'
                );
                setShipmentForm({
                    perfumeId: '',
                    type: 'incoming',
                    inputQuantity: '',
                    inputUnit: 'g',
                    costPerUnit: '',
                    supplier: '',
                    notes: '',
                });
                setShowAddShipment(false);
                fetchPerfumes();
                fetchRecentShipments();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to record shipment');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const formatStock = (perfume: Perfume) => {
        if (perfume.unit === 'kg') {
            return `${(perfume.currentStock / 1000).toFixed(2)} kg`;
        }
        return `${perfume.currentStock.toLocaleString()} g`;
    };

    const formatMinStock = (perfume: Perfume) => {
        if (perfume.unit === 'kg') {
            return `${(perfume.minStockLevel / 1000).toFixed(2)} kg`;
        }
        return `${perfume.minStockLevel.toLocaleString()} g`;
    };

    const lowStockCount = perfumes.filter(p => p.isLowStock).length;
    const totalStock = perfumes.reduce((acc, p) => acc + p.currentStock, 0);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50/50">


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h1>
                        <p className="text-slate-500 mt-1">
                            Manage your perfume stock levels
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            className="rounded-xl shadow-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                            onClick={() => setShowAddPerfume(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            product
                        </Button>
                        <Button
                            className="rounded-xl shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => setShowAddShipment(true)}
                        >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Record Shipment
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products</p>
                            <div className="text-3xl font-bold text-slate-900 mt-1">{perfumes.length}</div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock</p>
                            <div className="text-3xl font-bold text-slate-900 mt-1">
                                {totalStock >= 1000
                                    ? `${(totalStock / 1000).toFixed(1)}kg`
                                    : `${totalStock}g`}
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                    <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between transition-colors
                        ${lowStockCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Low Stock</p>
                            <div className={`text-3xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                                {lowStockCount}
                            </div>
                        </div>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-white' : 'bg-rose-50'}`}>
                            <AlertTriangle className={`h-6 w-6 ${lowStockCount > 0 ? 'text-rose-600' : 'text-rose-400'}`} />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-8">
                    {/* Inventory Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-900">Stock Levels</h2>
                                <Tabs value={stockFilter} onValueChange={setStockFilter} className="w-full sm:w-auto">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
                                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">All Stock</TabsTrigger>
                                        <TabsTrigger value="low" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600">Low Stock</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    placeholder="Search perfumes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {perfumes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No perfumes found matching your criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        perfumes.map((perfume) => (
                                            <tr key={perfume._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{perfume.name}</div>
                                                    {perfume.description && <div className="text-xs text-slate-500 truncate max-w-[150px]">{perfume.description}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                                        {perfume.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-700">
                                                    {formatStock(perfume)}
                                                    <div className="text-xs text-slate-400">Min: {formatMinStock(perfume)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {perfume.isLowStock ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setShipmentForm(prev => ({
                                                                ...prev,
                                                                perfumeId: perfume._id,
                                                                inputUnit: perfume.unit,
                                                            }));
                                                            setShowAddShipment(true);
                                                        }}
                                                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {perfumes.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No perfumes found
                                </div>
                            ) : (
                                perfumes.map((perfume) => (
                                    <div key={perfume._id} className="p-5 flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-900">{perfume.name}</div>
                                            <div className="text-xs text-slate-500">{perfume.category}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs font-medium text-slate-700">
                                                    {formatStock(perfume)}
                                                </div>
                                                {perfume.isLowStock && (
                                                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">Low Stock</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShipmentForm(prev => ({
                                                    ...prev,
                                                    perfumeId: perfume._id,
                                                    inputUnit: perfume.unit,
                                                }));
                                                setShowAddShipment(true);
                                            }}
                                            className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Shipments Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Recent Movements</h2>
                            <p className="text-xs text-slate-500 mt-1">Latest stock adjustments</p>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Perfume</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4">By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {shipments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No recent activity
                                            </td>
                                        </tr>
                                    ) : (
                                        shipments.map((shipment) => (
                                            <tr key={shipment._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(shipment.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {shipment.perfume?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border 
                                                        ${shipment.type === 'incoming'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : shipment.type === 'outgoing'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                                : 'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {shipment.type === 'incoming' && <TrendingUp className="h-3 w-3" />}
                                                        {shipment.type === 'outgoing' && <TrendingDown className="h-3 w-3" />}
                                                        {shipment.type === 'adjustment' && <ArrowUpDown className="h-3 w-3" />}
                                                        <span className="capitalize">{shipment.type}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                                    {shipment.type === 'incoming' ? '+' : shipment.type === 'outgoing' ? '-' : ''}
                                                    {shipment.inputQuantity} {shipment.inputUnit}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {shipment.createdBy}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Activity List */}
                        <div className="md:hidden">
                            {shipments.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No recent activity
                                </div>
                            ) : (
                                <div className="relative pl-6 pb-6 pt-6 space-y-8">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-slate-100"></div>

                                    {shipments.map((shipment) => (
                                        <div key={shipment._id} className="relative flex items-start gap-4 pr-6">
                                            {/* Node */}
                                            <div className={`z-10 h-3 w-3 rounded-full border-2 border-white ring-2 ring-offset-2 mt-1.5 flex-shrink-0
                                                ${shipment.type === 'incoming'
                                                    ? 'bg-emerald-500 ring-emerald-100'
                                                    : shipment.type === 'outgoing'
                                                        ? 'bg-rose-500 ring-rose-100'
                                                        : 'bg-blue-500 ring-blue-100'
                                                }`}></div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-slate-900">{shipment.perfume?.name}</span>
                                                    <span className="text-xs text-slate-400">{new Date(shipment.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    <span className={`font-semibold capitalize ${shipment.type === 'incoming' ? 'text-emerald-600' :
                                                        shipment.type === 'outgoing' ? 'text-rose-600' : 'text-blue-600'
                                                        }`}>{shipment.type}</span>
                                                    <span className="mx-1">•</span>
                                                    <span className="font-mono text-slate-700">
                                                        {shipment.type === 'incoming' ? '+' : shipment.type === 'outgoing' ? '-' : ''}
                                                        {shipment.inputQuantity}{shipment.inputUnit}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Perfume Modal */}
            {showAddPerfume && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Add New Perfume</h3>
                                <p className="text-xs text-slate-500">Enter product details below</p>
                            </div>
                            <button
                                onClick={() => setShowAddPerfume(false)}
                                className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddPerfume} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name *</label>
                                    <input
                                        value={perfumeForm.name}
                                        onChange={(e) => setPerfumeForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all font-medium"
                                        placeholder="e.g. Royal Oud"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={perfumeForm.description}
                                        onChange={(e) => setPerfumeForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all resize-none"
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</label>
                                        <div className="relative">
                                            <select
                                                value={perfumeForm.unit}
                                                onChange={(e) => setPerfumeForm(prev => ({ ...prev, unit: e.target.value as 'g' | 'kg' }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all appearance-none"
                                            >
                                                <option value="g">Grams (g)</option>
                                                <option value="kg">Kilograms (kg)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min Stock</label>
                                        <input
                                            type="number"
                                            value={perfumeForm.minStockLevel}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, minStockLevel: parseFloat(e.target.value) || 0 }))}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                        <input
                                            value={perfumeForm.category}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                            placeholder="e.g. Floral"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
                                        <input
                                            value={perfumeForm.supplier}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, supplier: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPerfume(false)}
                                        className="h-11 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-11 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Create Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Shipment Modal */}
            {showAddShipment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Record Shipment</h3>
                                <p className="text-xs text-slate-500">Track incoming or outgoing stock</p>
                            </div>
                            <button
                                onClick={() => setShowAddShipment(false)}
                                className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddShipment} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Movement Type</label>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                            {[
                                                { id: 'incoming', label: 'In', icon: TrendingUp },
                                                { id: 'outgoing', label: 'Out', icon: TrendingDown },
                                                { id: 'adjustment', label: 'Set', icon: ArrowUpDown }
                                            ].map((type) => {
                                                const Icon = type.icon;
                                                const isSelected = shipmentForm.type === type.id;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setShipmentForm(prev => ({ ...prev, type: type.id as any }))}
                                                        className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${isSelected ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                                                            }`}
                                                    >
                                                        <Icon className={`h-4 w-4 mb-1 ${isSelected ? (type.id === 'incoming' ? 'text-green-600' : type.id === 'outgoing' ? 'text-rose-600' : 'text-blue-600') : ''
                                                            }`} />
                                                        <span className="text-xs">{type.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfume</label>
                                        <select
                                            value={shipmentForm.perfumeId}
                                            onChange={(e) => setShipmentForm(prev => ({ ...prev, perfumeId: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all font-medium"
                                        >
                                            <option value="">Select a perfume...</option>
                                            {perfumes.map(p => (
                                                <option key={p._id} value={p._id}>{p.name} ({formatStock(p)})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                                        <input
                                            type="number"
                                            value={shipmentForm.inputQuantity}
                                            onChange={(e) => setShipmentForm(prev => ({ ...prev, inputQuantity: e.target.value }))}
                                            required
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</label>
                                        <select
                                            value={shipmentForm.inputUnit}
                                            onChange={(e) => setShipmentForm(prev => ({ ...prev, inputUnit: e.target.value }))}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                        >
                                            <option value="g">Grams (g)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                        </select>
                                    </div>
                                </div>

                                {shipmentForm.type === 'incoming' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost/{shipmentForm.inputUnit}</label>
                                            <input
                                                type="number"
                                                value={shipmentForm.costPerUnit}
                                                onChange={(e) => setShipmentForm(prev => ({ ...prev, costPerUnit: e.target.value }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
                                            <input
                                                value={shipmentForm.supplier}
                                                onChange={(e) => setShipmentForm(prev => ({ ...prev, supplier: e.target.value }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                                    <input
                                        value={shipmentForm.notes}
                                        onChange={(e) => setShipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all"
                                        placeholder="Optional..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddShipment(false)}
                                        className="h-11 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !shipmentForm.perfumeId}
                                        className="h-11 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
