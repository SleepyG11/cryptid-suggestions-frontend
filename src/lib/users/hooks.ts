'use client';

import useSWR from 'swr';
import { getLocalUser, getAllUsers, getUser } from './actions';
import { handleActionResponse } from '../common/actionResponse';

export function useLocalUser() {
    return useSWR(
        '/users/local',
        () => getLocalUser().then(handleActionResponse),
        {
            revalidateOnReconnect: true,
            revalidateOnFocus: false,
            revalidateIfStale: true,
            refreshInterval: 1000 * 60 * 5,
        }
    );
}

export function useUsers() {
    return useSWR('/users', () => getAllUsers().then(handleActionResponse), {
        fallbackData: [],
    });
}

export function useUser(userId?: number) {
    return useSWR(
        () => (userId != null ? `/users/${userId}` : null),
        () => getUser(userId!).then(handleActionResponse),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );
}
