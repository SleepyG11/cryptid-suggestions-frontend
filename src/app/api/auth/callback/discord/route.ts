import { NextRequest, NextResponse } from 'next/server';
import { loginFromCode } from '@/lib/discord-oauth2/actions';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const code = searchParams.get('code');
    // const state = searchParams.get('state');
    if (!code) throw new Error('Invalid request');

    await loginFromCode(
        code,
        '',
        request.nextUrl.origin + request.nextUrl.pathname
    ).catch((e) => {
        console.error(e);
        return NextResponse.redirect(new URL('/', request.url));
    });

    return NextResponse.redirect(new URL('/', request.url));
}
