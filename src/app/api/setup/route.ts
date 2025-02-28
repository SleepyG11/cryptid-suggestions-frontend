import seedDatabase from '@/database/seeding';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This route is only available in development mode' },
            { status: 403 }
        );
    }
    await seedDatabase();
    return NextResponse.json({ success: true });
}
