import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admin to subscribe to push notifications
        if (session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Only admin can subscribe to push notifications' }, { status: 403 });
        }

        await dbConnect();

        const body = await request.json();
        const { subscription, userAgent } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
        }

        // Check if subscription already exists
        const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

        if (existing) {
            // Update existing subscription
            existing.keys = subscription.keys;
            existing.userAgent = userAgent;
            await existing.save();
            return NextResponse.json({ message: 'Subscription updated' });
        }

        // Create new subscription
        await PushSubscription.create({
            userId: session.user.id,
            userRole: session.user.role,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            userAgent,
        });

        return NextResponse.json({ message: 'Subscribed to push notifications' }, { status: 201 });
    } catch (error) {
        console.error('Error subscribing to push:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
        }

        await PushSubscription.deleteOne({ endpoint });

        return NextResponse.json({ message: 'Unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error unsubscribing from push:', error);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }
}
