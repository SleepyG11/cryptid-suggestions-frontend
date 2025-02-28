export type DiscordTokensExchangeResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
};

export type AccessJWTTokenPayload = {
    access: string;
    id: string;
};

export type RefreshJWTTokenPayload = {
    refresh: string;
    id: string;
};
