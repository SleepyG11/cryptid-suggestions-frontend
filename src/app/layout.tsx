import './reset.css';
import './globals.scss';
import type { Metadata } from 'next';
import LayoutClient from './layout.client';
import { getLocalUser } from '@/lib/users/actions';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: {
        template: '%s | Cryptid Suggestions Site',
        default: 'Cryptid Suggestions Site',
    },
    description:
        'Cryptid is a content mod that adds lots of new things to Balatro, with a big twist: It is all unbalanced.',
};

import { IBM_Plex_Mono } from 'next/font/google';
const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ibm-plex-mono',
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const localUser = await getLocalUser(true);

    return (
        <html lang="en" className={ibmPlexMono.variable}>
            <LayoutClient localUser={localUser.success ? localUser.data : null}>
                <body>{children}</body>
            </LayoutClient>
        </html>
    );
}
