'use client';

import useSWR from 'swr';
import { getAllRoles, getRoleById, updateRole, createRole } from './actions';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import type { Attributes } from 'sequelize';
import { Role } from '@/database/models/User.model';
import { handleAction } from '../common/actionResponse';

export function useRoles() {
    return useSWR('/roles', () => handleAction(getAllRoles()), {
        fallbackData: [],
    });
}

export function useRole(roleId?: number | null) {
    return useSWR<Attributes<Role> | null>(
        () => (roleId != null ? `/roles/${roleId}` : null),
        () => handleAction(getRoleById(roleId!)),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );
}

export function useCreateRoleMutation() {
    return useSWRMutation(
        '/roles',
        (key: string, { arg }: { arg: any }) => handleAction(createRole(arg)),
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
            handleAction(updateRole(roleId!, arg)),
        {
            onSuccess: () => {
                mutate('/roles');
            },
        }
    );
}
