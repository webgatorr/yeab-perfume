import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

// GET - Get financial statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: any = {};

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const grouping = searchParams.get('grouping') || 'month'; // 'day' or 'month'

        // Calculate totals
        const [incomeResult, expenseResult] = await Promise.all([
            Transaction.aggregate([
                { $match: { ...query, type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Transaction.aggregate([
                { $match: { ...query, type: 'expense' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        const totalIncome = incomeResult[0]?.total || 0;
        const totalExpense = expenseResult[0]?.total || 0;
        const netProfit = totalIncome - totalExpense;

        // Get category breakdown
        const categoryBreakdown = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { type: '$type', category: '$category' },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { total: -1 } },
        ]);

        // Get trends based on date range and grouping
        const dateGroup = grouping === 'day'
            ? {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
            }
            : {
                year: { $year: '$date' },
                month: { $month: '$date' }
            };

        const trends = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        ...dateGroup,
                        type: '$type',
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);

        return NextResponse.json({
            summary: {
                totalIncome,
                totalExpense,
                netProfit,
            },
            categoryBreakdown,
            trends,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
