import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Fetch orders with search and filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const emirate = searchParams.get('emirate') || '';
        const orderTaker = searchParams.get('orderTaker') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query: any = {};

        // Search across multiple fields
        if (search) {
            // Escape special regex characters to prevent invalid regex errors
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchNumber = parseInt(search);
            query.$or = [
                { whatsappNumber: { $regex: escapedSearch, $options: 'i' } },
                { directPhone: { $regex: escapedSearch, $options: 'i' } },
                { perfumeChoice: { $regex: escapedSearch, $options: 'i' } },
                { customTextContent: { $regex: escapedSearch, $options: 'i' } },
                { orderTaker: { $regex: escapedSearch, $options: 'i' } },
                { emirate: { $regex: escapedSearch, $options: 'i' } },
                { area: { $regex: escapedSearch, $options: 'i' } },
                { receiptNumber: { $regex: escapedSearch, $options: 'i' } },
                { couponNumber: { $regex: escapedSearch, $options: 'i' } },
                { notes: { $regex: escapedSearch, $options: 'i' } },
            ];

            if (!isNaN(searchNumber)) {
                query.$or.push({ orderNumber: searchNumber });
            }
        }

        // Filters
        if (status) query.status = status;
        if (emirate) query.emirate = emirate;
        if (orderTaker) query.orderTaker = { $regex: orderTaker, $options: 'i' };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ orderNumber: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST - Create new order
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Get the next order number
        const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).lean();
        const nextOrderNumber = (lastOrder?.orderNumber || 0) + 1;

        // Create order with createdBy field from session
        const order = await Order.create({
            ...body,
            orderNumber: nextOrderNumber,
            createdBy: session.user.id !== 'env-admin' ? session.user.id : undefined,
            orderTaker: body.orderTaker || session.user.name,
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
