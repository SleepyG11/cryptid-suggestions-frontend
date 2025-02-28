import {
    DISCORD_OAUTH2_SCOPE,
    DISCORD_CLIENT_ID,
    DISCORD_OAUTH2_URL,
} from './constants';

export function getDiscordOAuth2LoginUrl(redirectUri: string) {
    const searchParams = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: DISCORD_OAUTH2_SCOPE,
    } as Record<string, string>);
    return DISCORD_OAUTH2_URL + '/authorize?' + searchParams.toString();
}
