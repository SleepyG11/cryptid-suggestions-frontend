import { Middleware } from 'swr';

export type ActionFailResponse = {
    success: false;
    status: number;
    message: string;
};
export type ActionSuccessResponse<T> = {
    success: true;
    data: T;
};
export type ActionResponse<T> = ActionSuccessResponse<T> | ActionFailResponse;

export class ActionError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

export function handleActionResponse<T>(result: ActionResponse<T>): T {
    if (!result.success) {
        throw new ActionError(result.message, result.status);
    }
    return result.data;
}
export async function handleAction<T>(
    action: Promise<ActionResponse<T>>
): Promise<T> {
    return action
        .catch((e) => {
            if (e instanceof ActionError) {
                throw e;
            }
            throw new ActionError(e.message, 500);
        })
        .then(handleActionResponse);
}

export function actionResponse<T>(data: T): ActionSuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

export function actionError(
    status: number,
    message: string
): ActionFailResponse {
    return {
        success: false,
        status,
        message,
    };
}
actionError.databaseError = (e?: any) => {
    if (process.env.NODE_ENV !== 'development') {
        return actionError(500, 'Internal server error');
    }
    return actionError(
        500,
        ['Database error', e?.message].filter(Boolean).join(': ')
    );
};
actionError.internalServerError = (e?: any) => {
    if (process.env.NODE_ENV !== 'development') {
        return actionError(500, 'Internal server error');
    }
    return actionError(
        500,
        ['Internal server error', e?.message].filter(Boolean).join(': ')
    );
};
actionError.badRequest = (message?: string) =>
    actionError(400, message ?? 'Bad request');
actionError.unauthorized = (message?: string) =>
    actionError(401, message ?? 'Unauthorized');
actionError.forbidden = (message?: string) =>
    actionError(403, message ?? 'Forbidden');
actionError.notFound = (message?: string) =>
    actionError(404, message ?? 'Not found');
