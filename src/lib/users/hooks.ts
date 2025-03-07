'use client';

import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { getLocalUser, getUsers, getUser } from './actions';
import { handleAction } from '../common/actionResponse';

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

export function useUsers(options?: { filter?: string; roles?: string[] }) {
    return useSWR(
        '/users/all?' +
            new URLSearchParams({
                filter: options?.filter ?? '',
                roles: options?.roles?.sort().join(',') ?? '',
            }).toString(),
        () => handleAction(getUsers(options))
    );
}

export function useUser(userId?: number) {
    return useSWRImmutable(
        () => (userId != null ? `/users/${userId}` : null),
        () => handleAction(getUser(userId!))
    );
}
