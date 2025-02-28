import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ hostname: 'cdn.discordapp.com' }],
    },
    serverExternalPackages: ['pg', 'sequelize-typescript'],
};

export default nextConfig;
