'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const [selectedPerfume, setSelectedPerfume] = useState<string>('');

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
                router.push('/');
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                        <p className="text-muted-foreground">
                            Manage your perfume stock levels
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowAddPerfume(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Perfume
                        </Button>
                        <Button onClick={() => setShowAddShipment(true)}>
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Record Shipment
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-2 sm:p-6">
                            <CardTitle className="text-sm font-medium truncate">Products</CardTitle>
                            <Package className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">{perfumes.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-2 sm:p-6">
                            <CardTitle className="text-sm font-medium truncate">Stock</CardTitle>
                            <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {totalStock >= 1000
                                    ? `${(totalStock / 1000).toFixed(1)}kg`
                                    : `${totalStock}g`}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`${lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-2 sm:p-6">
                            <CardTitle className="text-sm font-medium truncate">Low Stock</CardTitle>
                            <AlertTriangle className={`h-5 w-5 sm:h-4 sm:w-4 ${lowStockCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
                            <div className={`text-lg sm:text-2xl font-bold truncate ${lowStockCount > 0 ? 'text-red-600' : ''}`}>
                                {lowStockCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Inventory Table */}
                <Card className="mb-8">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle>Stock Levels</CardTitle>
                                <Tabs
                                    value={stockFilter}
                                    onValueChange={setStockFilter}
                                >
                                    <TabsList>
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="low" className="data-[state=active]:text-red-600">
                                            Low Stock
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search perfumes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Min Level</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {perfumes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No perfumes found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    perfumes.map((perfume) => (
                                        <TableRow key={perfume._id}>
                                            <TableCell className="font-medium">{perfume.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {perfume.category || '-'}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {formatStock(perfume)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono">
                                                {formatMinStock(perfume)}
                                            </TableCell>
                                            <TableCell>
                                                {perfume.isLowStock ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                                        In Stock
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShipmentForm(prev => ({
                                                            ...prev,
                                                            perfumeId: perfume._id,
                                                            inputUnit: perfume.unit,
                                                        }));
                                                        setShowAddShipment(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Stock
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Shipments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Stock Movements</CardTitle>
                        <CardDescription>Last 10 shipments and adjustments</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Perfume</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shipments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No shipments recorded yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    shipments.map((shipment) => (
                                        <TableRow key={shipment._id}>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(shipment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {shipment.perfume?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                                                    ${shipment.type === 'incoming'
                                                        ? 'bg-green-50 text-green-700'
                                                        : shipment.type === 'outgoing'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {shipment.type === 'incoming' && <TrendingUp className="h-3 w-3" />}
                                                    {shipment.type === 'outgoing' && <TrendingDown className="h-3 w-3" />}
                                                    {shipment.type.charAt(0).toUpperCase() + shipment.type.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {shipment.type === 'incoming' ? '+' : shipment.type === 'outgoing' ? '-' : ''}
                                                {shipment.inputQuantity} {shipment.inputUnit}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {shipment.createdBy}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            {/* Add Perfume Modal */}
            {showAddPerfume && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Add New Perfume</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddPerfume(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddPerfume} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={perfumeForm.name}
                                        onChange={(e) => setPerfumeForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={perfumeForm.description}
                                        onChange={(e) => setPerfumeForm(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="unit">Display Unit</Label>
                                        <Select
                                            value={perfumeForm.unit}
                                            onValueChange={(value) => setPerfumeForm(prev => ({ ...prev, unit: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="g">Grams (g)</SelectItem>
                                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="minStock">Min Stock Level</Label>
                                        <Input
                                            id="minStock"
                                            type="number"
                                            min="0"
                                            value={perfumeForm.minStockLevel}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, minStockLevel: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={perfumeForm.category}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, category: e.target.value }))}
                                            placeholder="e.g., Oud, Floral"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="supplier">Supplier</Label>
                                        <Input
                                            id="supplier"
                                            value={perfumeForm.supplier}
                                            onChange={(e) => setPerfumeForm(prev => ({ ...prev, supplier: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddPerfume(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Perfume'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Shipment Modal */}
            {showAddShipment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Record Stock Movement</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddShipment(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddShipment} className="space-y-4">
                                <div>
                                    <Label>Perfume *</Label>
                                    <Select
                                        value={shipmentForm.perfumeId}
                                        onValueChange={(value) => setShipmentForm(prev => ({ ...prev, perfumeId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select perfume" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {perfumes.map(p => (
                                                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Type *</Label>
                                    <Select
                                        value={shipmentForm.type}
                                        onValueChange={(value: 'incoming' | 'outgoing' | 'adjustment') => setShipmentForm(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="incoming">
                                                <span className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    Incoming (Add Stock)
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="outgoing">
                                                <span className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                    Outgoing (Remove Stock)
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="adjustment">
                                                <span className="flex items-center gap-2">
                                                    <ArrowUpDown className="h-4 w-4 text-blue-600" />
                                                    Adjustment (Set Stock)
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Quantity *</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={shipmentForm.inputQuantity}
                                            onChange={(e) => setShipmentForm(prev => ({ ...prev, inputQuantity: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Unit</Label>
                                        <Select
                                            value={shipmentForm.inputUnit}
                                            onValueChange={(value) => setShipmentForm(prev => ({ ...prev, inputUnit: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="g">Grams (g)</SelectItem>
                                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {shipmentForm.type === 'incoming' && (
                                    <>
                                        <div>
                                            <Label>Cost per {shipmentForm.inputUnit === 'kg' ? 'kg' : 'gram'}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={shipmentForm.costPerUnit}
                                                onChange={(e) => setShipmentForm(prev => ({ ...prev, costPerUnit: e.target.value }))}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div>
                                            <Label>Supplier</Label>
                                            <Input
                                                value={shipmentForm.supplier}
                                                onChange={(e) => setShipmentForm(prev => ({ ...prev, supplier: e.target.value }))}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <Label>Notes</Label>
                                    <Input
                                        value={shipmentForm.notes}
                                        onChange={(e) => setShipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Optional notes"
                                    />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddShipment(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={submitting || !shipmentForm.perfumeId}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
