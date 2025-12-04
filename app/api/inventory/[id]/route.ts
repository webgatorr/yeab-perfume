import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Perfume from '@/models/Perfume';

// GET - Fetch single perfume
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const perfume = await Perfume.findById(id).lean();

        if (!perfume) {
            return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...perfume,
            displayStock: (perfume as any).unit === 'kg' ? (perfume as any).currentStock / 1000 : (perfume as any).currentStock,
            isLowStock: (perfume as any).currentStock <= (perfume as any).minStockLevel,
        });
    } catch (error) {
        console.error('Error fetching perfume:', error);
        return NextResponse.json({ error: 'Failed to fetch perfume' }, { status: 500 });
    }
}

// PUT - Update perfume
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // If updating minStockLevel, convert to grams
        if (body.minStockLevel !== undefined && body.unit) {
            if (body.unit === 'kg') {
                body.minStockLevel = body.minStockLevel * 1000;
            }
        }

        const perfume = await Perfume.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!perfume) {
            return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
        }

        return NextResponse.json(perfume);
    } catch (error: any) {
        console.error('Error updating perfume:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A perfume with this name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update perfume' }, { status: 500 });
    }
}

// DELETE - Delete perfume (soft delete by setting isActive to false)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const perfume = await Perfume.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!perfume) {
            return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Perfume deactivated successfully' });
    } catch (error) {
        console.error('Error deleting perfume:', error);
        return NextResponse.json({ error: 'Failed to delete perfume' }, { status: 500 });
    }
}
