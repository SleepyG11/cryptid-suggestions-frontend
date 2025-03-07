import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ hostname: 'cdn.discordapp.com' }],
    },
    serverExternalPackages: ['pg', 'sequelize-typescript'],
    webpack(config) {
        config.ignoreWarnings = [
            {
                module: /sequelize/,
                message: /Module not found|dependency is an expression/,
            },
        ];
        return config;
    },
};

export default nextConfig;
