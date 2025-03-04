'use client';

import useSWR from 'swr';
import { getAllRoles, getRoleById, updateRole, createRole } from './actions';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import type { Attributes } from 'sequelize';
import { Role } from '@/database/models/User.model';
import { handleActionResponse } from '../common/actionResponse';

export function useRoles() {
    return useSWR('/roles', () => getAllRoles().then(handleActionResponse), {
        fallbackData: [],
    });
}

export function useRole(roleId?: number | null) {
    return useSWR<Attributes<Role> | null>(
        () => (roleId != null ? `/roles/${roleId}` : null),
        () => getRoleById(roleId!).then(handleActionResponse),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );
}

export function useCreateRoleMutation() {
    return useSWRMutation(
        '/roles',
        (key: string, { arg }: { arg: any }) =>
            createRole(arg).then(handleActionResponse),
        {
            revalidate: true,
            populateCache: (newData, currentData) => {
                mutate('/roles/' + newData.id, newData);
            },
        }
    );
}

export function useUpdateRoleMutation(roleId?: number | null) {
    return useSWRMutation(
        () => (roleId != null ? `/roles/${roleId}` : null),
        (key: string, { arg }: { arg: any }) =>
            updateRole(roleId!, arg).then(handleActionResponse),
        {
            onSuccess: () => {
                mutate('/roles');
            },
        }
    );
}
