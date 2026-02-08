import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Shipment from '@/models/Shipment';
import Perfume from '@/models/Perfume';
import { notifyShipmentCreated } from '@/lib/notifications';

// GET - Fetch shipments with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const perfumeId = searchParams.get('perfumeId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query: any = {};

        if (perfumeId) query.perfume = perfumeId;
        if (type) query.type = type;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [shipments, total] = await Promise.all([
            Shipment.find(query)
                .populate('perfume', 'name unit')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Shipment.countDocuments(query),
        ]);

        return NextResponse.json({
            shipments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
    }
}

// POST - Create new shipment and update stock
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { perfumeId, type, inputQuantity, inputUnit, costPerUnit, supplier, notes, date } = body;

        // Convert quantity to grams
        const quantityInGrams = inputUnit === 'kg' ? inputQuantity * 1000 : inputQuantity;

        // Calculate total cost
        const totalCost = costPerUnit ? costPerUnit * inputQuantity : undefined;

        // Find the perfume
        const perfume = await Perfume.findById(perfumeId);
        if (!perfume) {
            return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
        }

        // Calculate new stock level
        let stockChange = quantityInGrams;
        if (type === 'outgoing') {
            stockChange = -quantityInGrams;
        } else if (type === 'adjustment') {
            // For adjustments, the quantity is the absolute new value
            stockChange = quantityInGrams - perfume.currentStock;
        }

        const newStock = perfume.currentStock + stockChange;

        if (newStock < 0) {
            return NextResponse.json({ error: 'Insufficient stock for this operation' }, { status: 400 });
        }

        // Create shipment record
        const shipment = await Shipment.create({
            perfume: perfumeId,
            type,
            quantity: type === 'adjustment' ? quantityInGrams : Math.abs(stockChange),
            inputUnit,
            inputQuantity,
            costPerUnit,
            totalCost,
            supplier,
            notes,
            date: date || new Date(),
            createdBy: session.user?.name || 'Admin',
        });

        // Update perfume stock
        perfume.currentStock = newStock;

        // Update cost per gram if this is an incoming shipment with cost
        if (type === 'incoming' && costPerUnit && inputQuantity > 0) {
            const costPerGram = inputUnit === 'kg' ? costPerUnit / 1000 : costPerUnit;
            // Calculate weighted average cost
            if (perfume.costPerGram && perfume.currentStock > quantityInGrams) {
                const oldTotal = perfume.costPerGram * (perfume.currentStock - quantityInGrams);
                const newTotal = costPerGram * quantityInGrams;
                perfume.costPerGram = (oldTotal + newTotal) / perfume.currentStock;
            } else {
                perfume.costPerGram = costPerGram;
            }
        }

        await perfume.save();

        // Populate and return
        const populatedShipment = await Shipment.findById(shipment._id)
            .populate('perfume', 'name unit currentStock')
            .lean();

        return NextResponse.json(populatedShipment, { status: 201 });

        // Send notification to admin if action was done by staff
        // @ts-ignore
        const user = session!.user;
        if (user?.role === 'staff') {
            notifyShipmentCreated(
                perfume.name,
                type,
                inputQuantity,
                inputUnit,
                user.name || user.username || 'Staff',
                user.id
            );
        }
    } catch (error) {
        console.error('Error creating shipment:', error);
        return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
    }
}
