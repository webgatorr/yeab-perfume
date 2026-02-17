import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

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
        const grouping = searchParams.get('grouping') || 'month'; // 'day' or 'month'

        const query: any = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // 1. Summary Stats
        const summaryStats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    canceledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    // Only count revenue from non-cancelled orders
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $ne: ['$status', 'cancelled'] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const summary = summaryStats[0] || {
            totalOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            canceledOrders: 0,
            totalRevenue: 0
        };

        // 2. Trends (Orders over time)
        const dateGroup = grouping === 'day'
            ? {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            }
            : {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };

        const trends = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: dateGroup,
                    count: { $sum: 1 },
                    // Only count revenue from non-cancelled orders
                    revenue: {
                        $sum: {
                            $cond: [
                                { $ne: ['$status', 'cancelled'] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // 3. Top Products
        const topProducts = await Order.aggregate([
            { $match: { ...query, status: { $ne: 'cancelled' } } }, // Exclude cancelled orders
            {
                $group: {
                    _id: '$perfumeChoice',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 4. Orders by Location (Emirate)
        const locationStats = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$emirate',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return NextResponse.json({
            summary,
            trends,
            topProducts,
            locationStats
        });

    } catch (error) {
        console.error('Error fetching order stats:', error);
        return NextResponse.json({ error: 'Failed to fetch order statistics' }, { status: 500 });
    }
}
