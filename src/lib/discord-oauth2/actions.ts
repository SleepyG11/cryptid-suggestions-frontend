'use server';

import { cookies } from 'next/headers';
import {
    DISCORD_ACCESS_TOKEN_COOKIE,
    DISCORD_API_URL,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_OAUTH2_SCOPE,
    DISCORD_OAUTH2_URL,
    DISCORD_REFRESH_TOKEN_COOKIE,
} from './constants';
import type {
    DiscordTokensExchangeResponse,
    AccessJWTTokenPayload,
    RefreshJWTTokenPayload,
} from './types';
import jwt from 'jsonwebtoken';

import { UserModel } from '@/database/sequelize';

// ------------------------

const signJWT = async <T extends object>(
    payload: T,
    options: jwt.SignOptions
): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.DISCORD_CLIENT_SECRET ?? '',
            options,
            (err, token) => {
                if (err) reject(err);
                else resolve(token as string);
            }
        );
    });
};
const verifyJWT = async <T extends object>(token: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.DISCORD_CLIENT_SECRET ?? '',
            (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded as T);
            }
        );
    });
};

// ------------------------

function verifyDiscordOAuth2State(state: string) {
    return true;
}
export async function verifyAccessJWTToken(accessToken?: string) {
    if (!accessToken) return null;
    return await verifyJWT<AccessJWTTokenPayload>(accessToken).catch(
        () => null
    );
}
export async function verifyRefreshJWTToken(refreshToken?: string) {
    if (!refreshToken) return null;
    return await verifyJWT<RefreshJWTTokenPayload>(refreshToken).catch(
        () => null
    );
}

// ------------------------

export async function setSessionCookies(
    exchangeResponse: DiscordTokensExchangeResponse,
    userId: string
) {
    const [accessTokenJWT, refreshTokenJWT] = await Promise.all([
        signJWT(
            {
                access: exchangeResponse.access_token,
                id: userId,
            },
            { expiresIn: exchangeResponse.expires_in, algorithm: 'HS256' }
        ),
        signJWT(
            {
                refresh: exchangeResponse.refresh_token,
                id: userId,
            },
            { expiresIn: 30 * 24 * 60 * 60, algorithm: 'HS256' }
        ),
    ]);

    const cookieStore = await cookies();
    cookieStore.set(DISCORD_ACCESS_TOKEN_COOKIE, accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: exchangeResponse.expires_in,
        path: '/',
    });
    cookieStore.set(DISCORD_REFRESH_TOKEN_COOKIE, refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
    });
}

// ------------------------

export async function exchangeOauthCode(
    code: string,
    state: string,
    redirectUri: string
): Promise<DiscordTokensExchangeResponse> {
    if (!verifyDiscordOAuth2State(state)) {
        throw new Error('Invalid state');
    }

    const searchParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
    } as Record<string, string>);

    const exchangeData = await fetch(DISCORD_API_URL + '/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: searchParams.toString(),
    }).then((r) => r.json());

    if (!exchangeData.access_token) {
        throw new Error('Invalid authorization response');
    }

    return exchangeData;
}
export async function exchangeRefreshToken(
    refreshToken: string
): Promise<DiscordTokensExchangeResponse> {
    const searchParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    } as Record<string, string>);

    const exchangeData = await fetch(DISCORD_API_URL + '/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: searchParams.toString(),
    }).then((r) => r.json());

    if (!exchangeData.access_token) {
        throw new Error('Invalid refresh response');
    }

    return exchangeData;
}
export async function revokeToken(
    token: string,
    type: 'access_token' | 'refresh_token'
) {
    return await fetch(DISCORD_API_URL + '/oauth2/token/revoke', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ token, token_type_hint: type }),
    }).then((r) => r.ok);
}

// ------------------------

export async function getDiscordUser(accessToken: string): Promise<any> {
    const userResponse = await fetch(DISCORD_API_URL + '/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userData = await userResponse.json();

    return userData;
}

// ------------------------

export async function loginFromCode(
    code: string,
    state: string,
    redirectUri: string
): Promise<AccessJWTTokenPayload | null> {
    try {
        const authData = await exchangeOauthCode(code, state, redirectUri);
        if (!authData.scope.includes('identify')) {
            throw new Error('Invalid scopes');
        }
        const userData = await getDiscordUser(authData.access_token);
        await UserModel.fromDiscordUser(userData);
        await setSessionCookies(authData, userData.id);
        return { id: userData.id, access: authData.access_token };
    } catch (e) {
        console.error(e);
        return null;
    }
}
export async function logout() {
    const cookieStore = await cookies();

    const accessJWT = cookieStore.get(DISCORD_ACCESS_TOKEN_COOKIE)?.value;
    const refreshJWT = cookieStore.get(DISCORD_REFRESH_TOKEN_COOKIE)?.value;

    await Promise.all([
        verifyAccessJWTToken(accessJWT).then((data) => {
            if (data?.access)
                return revokeToken(data.access, 'access_token').catch(
                    () => null
                );
        }),
        verifyRefreshJWTToken(refreshJWT).then((data) => {
            if (data?.refresh)
                return revokeToken(data.refresh, 'refresh_token').catch(
                    () => null
                );
        }),
    ]);

    cookieStore.delete(DISCORD_ACCESS_TOKEN_COOKIE);
    cookieStore.delete(DISCORD_REFRESH_TOKEN_COOKIE);
}
export async function getOrRefreshAccessToken(): Promise<AccessJWTTokenPayload | null> {
    const cookieStore = await cookies();
    const accessData = await verifyAccessJWTToken(
        cookieStore.get(DISCORD_ACCESS_TOKEN_COOKIE)?.value
    );
    if (accessData) return accessData;
    const refreshData = await verifyRefreshJWTToken(
        cookieStore.get(DISCORD_REFRESH_TOKEN_COOKIE)?.value
    );
    if (refreshData) {
        try {
            const authData = await exchangeRefreshToken(refreshData.refresh);
            if (!authData.scope.includes('identify')) {
                throw new Error('Invalid scopes');
            }
            const userData = await getDiscordUser(authData.access_token);
            await UserModel.fromDiscordUser(userData);
            await setSessionCookies(authData, userData.id);
            return { access: authData.access_token, id: userData.id };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    return null;
}
