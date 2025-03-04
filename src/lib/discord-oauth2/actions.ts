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
import {
    actionError,
    actionResponse,
    type ActionResponse,
} from '../common/actionResponse';

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
async function verifyAccessJWTToken(accessToken?: string) {
    if (!accessToken) return null;
    return await verifyJWT<AccessJWTTokenPayload>(accessToken).catch(
        () => null
    );
}
async function verifyRefreshJWTToken(refreshToken?: string) {
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
): Promise<ActionResponse<DiscordTokensExchangeResponse>> {
    if (!verifyDiscordOAuth2State(state)) {
        return actionError.badRequest('Invalid data');
    }

    const searchParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
    } as Record<string, string>);

    let exchangeData: DiscordTokensExchangeResponse;
    try {
        exchangeData = await fetch(DISCORD_API_URL + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: searchParams.toString(),
        }).then((r) => r.json());
    } catch (e) {
        console.error(e);
        return actionError.internalServerError();
    }

    if (!exchangeData.access_token) {
        return actionError.badRequest('Invalid data');
    }

    return actionResponse(exchangeData);
}
export async function exchangeRefreshToken(
    refreshToken: string
): Promise<ActionResponse<DiscordTokensExchangeResponse>> {
    const searchParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    } as Record<string, string>);

    let exchangeData: DiscordTokensExchangeResponse;
    try {
        exchangeData = await fetch(DISCORD_API_URL + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: searchParams.toString(),
        }).then((r) => r.json());
    } catch (e) {
        console.error(e);
        return actionError.internalServerError();
    }

    if (!exchangeData.access_token) {
        return actionError.badRequest('Invalid refresh token');
    }

    return actionResponse(exchangeData);
}
export async function revokeToken(
    token: string,
    type: 'access_token' | 'refresh_token'
): Promise<ActionResponse<undefined>> {
    let response: Response;
    try {
        response = await fetch(DISCORD_API_URL + '/oauth2/token/revoke', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ token, token_type_hint: type }),
        });
    } catch (e) {
        console.error(e);
        return {
            success: false,
            status: 500,
            message: 'Internal server error',
        };
    }

    if (!response.ok) {
        return actionError.badRequest('Failed to revoke token');
    }

    return actionResponse(undefined);
}

// ------------------------

export async function getDiscordUser(
    accessToken: string
): Promise<ActionResponse<any>> {
    let userResponse: Response;
    try {
        userResponse = await fetch(DISCORD_API_URL + '/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (e) {
        console.error(e);
        return actionError.internalServerError();
    }

    if (!userResponse.ok) {
        return actionError.badRequest('Failed to fetch user data');
    }

    const userData = await userResponse.json();

    return actionResponse(userData);
}

// ------------------------

export async function loginFromCode(
    code: string,
    state: string,
    redirectUri: string
): Promise<ActionResponse<AccessJWTTokenPayload>> {
    const authDataResult = await exchangeOauthCode(code, state, redirectUri);
    if (!authDataResult.success) return authDataResult;

    const authData = authDataResult.data;
    if (!authData.scope.includes('identify')) {
        return actionError.badRequest('Invalid scopes');
    }

    const userDataResult = await getDiscordUser(authData.access_token);
    if (!userDataResult.success) return userDataResult;

    const userData = userDataResult.data;

    try {
        await UserModel.fromDiscordUser(userData);
    } catch (e) {
        console.error(e);
        return actionError.databaseError();
    }

    await setSessionCookies(authData, userData.id);

    return actionResponse({
        id: userData.id,
        access: authData.access_token,
    });
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
export async function getOrRefreshAccessToken(): Promise<
    ActionResponse<AccessJWTTokenPayload>
> {
    const cookieStore = await cookies();
    const accessData = await verifyAccessJWTToken(
        cookieStore.get(DISCORD_ACCESS_TOKEN_COOKIE)?.value
    );
    if (accessData) {
        return actionResponse(accessData);
    }

    const refreshData = await verifyRefreshJWTToken(
        cookieStore.get(DISCORD_REFRESH_TOKEN_COOKIE)?.value
    );
    if (refreshData) {
        const authDataResult = await exchangeRefreshToken(refreshData.refresh);
        if (!authDataResult.success) return authDataResult;

        const authData = authDataResult.data;
        if (!authData.scope.includes('identify')) {
            return actionError.badRequest('Invalid scopes');
        }

        const userDataResult = await getDiscordUser(authData.access_token);
        if (!userDataResult.success) return userDataResult;

        const userData = userDataResult.data;
        try {
            await UserModel.fromDiscordUser(userData);
        } catch (e) {
            console.error(e);
            return actionError.databaseError();
        }
        await setSessionCookies(authData, userData.id);

        return actionResponse({
            access: authData.access_token,
            id: userData.id,
        });
    }

    return actionError.unauthorized();
}
