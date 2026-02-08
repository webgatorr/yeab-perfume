import { NextResponse } from 'next/server';

// GET - Return VAPID public key for push subscription
export async function GET() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 });
    }

    return NextResponse.json({ publicKey: vapidPublicKey });
}
