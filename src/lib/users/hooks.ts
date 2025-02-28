'use client';

import useSWR from 'swr';
import { getLocalUser, getAllUsers, getUser } from './actions';

export function useLocalUser() {
    return useSWR('/users/local', getLocalUser, {
        revalidateOnReconnect: true,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        refreshInterval: 1000 * 60 * 5,
    });
}

export function useUsers() {
    return useSWR('/users', getAllUsers, {
        fallbackData: [],
    });
}

export function useUser(userId?: number) {
    const action = getUser.bind(null, userId!);
    return useSWR(() => (userId != null ? `/users/${userId}` : null), action, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
}
