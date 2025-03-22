import '../globals.css';
import './main.scss';

import Header from '@/components/header/Header';

import BalatroShaderBackground from '@/components/background/BalatroMainMenuShader';
import { getLocalUser } from '@/lib/users/actions';
import { Metadata } from 'next';
import LayoutClient from './layout.client';

import { IBM_Plex_Mono } from 'next/font/google';
const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
    title: {
        template: '%s | Cryptid Suggestions Site Dashboard',
        default: 'Cryptid Suggestions Site Dashboard',
    },
};

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const localUser = await getLocalUser(true);

    return (
        <html lang="en" className={ibmPlexMono.variable}>
            <LayoutClient localUser={localUser.success ? localUser.data : null}>
                <body>
                    <BalatroShaderBackground />
                    <Header />
                    {children}
                </body>
            </LayoutClient>
        </html>
    );
}
