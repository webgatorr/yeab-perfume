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

        // Get monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await Transaction.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type',
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        return NextResponse.json({
            summary: {
                totalIncome,
                totalExpense,
                netProfit,
            },
            categoryBreakdown,
            monthlyTrends,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
