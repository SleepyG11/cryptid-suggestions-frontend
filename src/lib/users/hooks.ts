'use client';

import useSWR from 'swr';
import { getLocalUser, getAllUsers, getUser } from './actions';
import { handleAction } from '../common/actionResponse';

export function useLocalUser() {
    return useSWR('/users/local', () => handleAction(getLocalUser()), {
        revalidateOnReconnect: true,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        refreshInterval: 1000 * 60 * 5,
    });
}

export function useUsers() {
    return useSWR('/users', () => handleAction(getAllUsers()), {
        fallbackData: [],
    });
}

export function useUser(userId?: number) {
    return useSWR(
        () => (userId != null ? `/users/${userId}` : null),
        () => handleAction(getUser(userId!)),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );
}
