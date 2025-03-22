import '../globals.css';
import './dashboard.scss';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import BalatroRunShaderBackground from '@/components/background/BalatroRunShader';
import { IBM_Plex_Mono } from 'next/font/google';
import LayoutClient from './layout.client';
import { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

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

export default function Layout({
    children,
    sidepanel,
}: {
    children: React.ReactNode;
    sidepanel: React.ReactNode;
}) {
    return (
        <html lang="en" className={ibmPlexMono.variable}>
            <body>
                <NuqsAdapter>
                    <BalatroRunShaderBackground />
                    <LayoutClient>
                        {children}
                        {sidepanel}
                    </LayoutClient>
                </NuqsAdapter>
            </body>
        </html>
    );
}
