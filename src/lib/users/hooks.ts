'use client';

import useSWR, { mutate, SWRConfiguration } from 'swr';
import useSWRImmutable from 'swr/immutable';
import {
    getLocalUser,
    getUsers,
    getUser,
    updateUserPermissionsOverrides,
} from './actions';
import { handleAction } from '../common/actionResponse';
import useSWRMutation from 'swr/mutation';

// --------

export function revalidateUsers() {
    mutate((key) => {
        if (typeof key === 'string') return key.startsWith('/users/all');
        return false;
    });
}

// --------

export function useLocalUser() {
    return useSWR('/users/local', () => handleAction(getLocalUser()), {
        revalidateOnReconnect: true,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        refreshInterval: 1000 * 60 * 2,
    });
}

export function useUsers(
    options?: { filter?: string; roles?: string[] },
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        '/users/all?' +
            new URLSearchParams({
                filter: options?.filter ?? '',
                roles: options?.roles?.sort().join(',') ?? '',
            }).toString(),
        () => handleAction(getUsers(options)),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useUser(userId?: string) {
    return useSWRImmutable(
        () => (userId != null ? `/users/${userId}` : null),
        () => handleAction(getUser(userId!))
    );
}

export function useUpdateUserPermissionsOverridesMutation(userId?: string) {
    const { data: localUser, mutate } = useLocalUser();
    return useSWRMutation(
        () => (userId != null ? `/users/${userId}` : null),
        (_: string, { arg }: { arg: any }) =>
            handleAction(updateUserPermissionsOverrides(userId!, arg)),
        {
            onSuccess: () => {
                revalidateUsers();
                if (localUser?.id === userId) {
                    mutate(undefined, { revalidate: true });
                }
            },
        }
    );
}
