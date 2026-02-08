import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { notifyTransactionCreated } from '@/lib/notifications';

// GET - Fetch transactions with filters, search, and pagination
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query: any = {};

        if (type) query.type = type;

        // Search by category or description
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { category: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query),
        ]);

        return NextResponse.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        const transaction = await Transaction.create({
            ...body,
            createdBy: session.user?.name || 'Admin',
        });

        // Send notification to admin if action was done by staff
        if (session.user?.role === 'staff') {
            const t = transaction as any;
            const user = session.user as any;
            await notifyTransactionCreated(
                t.type,
                t.amount,
                t.category,
                user.name || user.username || 'Staff',
                user.id
            );
        }

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}

// DELETE - Clear all transactions
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Strict admin check
        // @ts-ignore
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        await Transaction.deleteMany({});

        return NextResponse.json({ message: 'All transactions deleted successfully' });
    } catch (error) {
        console.error('Error deleting all transactions:', error);
        return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
    }
}
