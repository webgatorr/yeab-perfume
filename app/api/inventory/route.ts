import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Perfume from '@/models/Perfume';

// GET - Fetch all perfumes with optional filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const lowStock = searchParams.get('lowStock');
        const category = searchParams.get('category');
        const isActive = searchParams.get('isActive');

        const query: any = {};

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
                { supplier: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        if (category) query.category = category;
        if (isActive !== null && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        let perfumes = await Perfume.find(query)
            .sort({ name: 1 })
            .lean();

        // Filter for low stock if requested
        if (lowStock === 'true') {
            perfumes = perfumes.filter((p: any) => p.currentStock <= p.minStockLevel);
        }

        // Add computed fields
        const perfumesWithComputed = perfumes.map((p: any) => ({
            ...p,
            displayStock: p.unit === 'kg' ? p.currentStock / 1000 : p.currentStock,
            isLowStock: p.currentStock <= p.minStockLevel,
        }));

        return NextResponse.json(perfumesWithComputed);
    } catch (error) {
        console.error('Error fetching perfumes:', error);
        return NextResponse.json({ error: 'Failed to fetch perfumes' }, { status: 500 });
    }
}

// POST - Create new perfume
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Convert initial stock to grams if provided in kg
        let currentStock = body.currentStock || 0;
        if (body.unit === 'kg' && currentStock > 0) {
            currentStock = currentStock * 1000;
        }

        // Convert min stock level to grams if provided in kg
        let minStockLevel = body.minStockLevel || 100;
        if (body.unit === 'kg') {
            minStockLevel = minStockLevel * 1000;
        }

        const perfume = await Perfume.create({
            ...body,
            currentStock,
            minStockLevel,
        });

        return NextResponse.json(perfume, { status: 201 });
    } catch (error: any) {
        console.error('Error creating perfume:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A perfume with this name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create perfume' }, { status: 500 });
    }
}
