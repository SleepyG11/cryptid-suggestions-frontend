'use client';

import { SWRConfig } from 'swr';

export default function LayoutClient({
    localUser,
    children,
}: {
    localUser: any | null;
    children: React.ReactNode;
}) {
    return (
        <SWRConfig
            value={{
                fallback: {
                    '/users/local': localUser,
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}
