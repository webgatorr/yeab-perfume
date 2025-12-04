import { NextRequest, NextResponse } from 'next/server';

// Finance credentials are stored in environment variables
// FINANCE_USERNAME and FINANCE_PASSWORD
const FINANCE_USERNAME = process.env.FINANCE_USERNAME || 'finance_admin';
const FINANCE_PASSWORD = process.env.FINANCE_PASSWORD || 'finance_secure_2024';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Check credentials
        if (username === FINANCE_USERNAME && password === FINANCE_PASSWORD) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Finance auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
