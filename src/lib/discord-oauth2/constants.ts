export const DISCORD_API_URL = 'https://discord.com/api/v10';
export const DISCORD_OAUTH2_URL = 'https://discord.com/oauth2';

export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

export const DISCORD_OAUTH2_SCOPE = 'identify';
export const DISCORD_REDIRECT_ENDPOINT = '/api/auth/callback/discord';

export const DISCORD_ACCESS_TOKEN_COOKIE = 'discord_access_token';
export const DISCORD_REFRESH_TOKEN_COOKIE = 'discord_refresh_token';

export const DISCORD_OAUTH2_REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URL}${DISCORD_REDIRECT_ENDPOINT}`;
export const DISCORD_OAUTH2_LOGIN_URL =
    `${DISCORD_OAUTH2_URL}/authorize?` +
    new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_OAUTH2_REDIRECT_URL,
        response_type: 'code',
        scope: DISCORD_OAUTH2_SCOPE,
    } as Record<string, string>).toString();
