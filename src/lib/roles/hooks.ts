'use client';

import useSWR from 'swr';
import { getAllRoles, getRoleById } from './actions';

export function useRoles() {
    return useSWR('/roles', getAllRoles, {
        fallbackData: [],
    });
}

export function useRole(roleId?: number) {
    const action = getRoleById.bind(null, roleId!);
    return useSWR(() => (roleId != null ? `/roles/${roleId}` : null), action, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
}
