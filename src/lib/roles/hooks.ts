'use client';

import useSWR, { SWRConfiguration } from 'swr';
import {
    getRoles,
    getRoleById,
    updateRole,
    createRole,
    getPublicRoles,
} from './actions';
import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';
import type { Attributes } from 'sequelize';
import { Role } from '@/database/models/User.model';
import { handleAction } from '../common/actionResponse';

// --------

export function revalidateRoles() {
    mutate((key) => {
        if (typeof key === 'string') return key.startsWith('/roles/all');
        return false;
    });
}

// ---------

export function usePublicRoles(swrOptions?: SWRConfiguration) {
    return useSWRImmutable(
        '/roles/all/public',
        () => handleAction(getPublicRoles()),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

// ---------

export function useRoles(
    options?: { filter?: string },
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        '/roles/all?' + new URLSearchParams(options).toString(),
        () => handleAction(getRoles(options)),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useRole(roleId?: string | null) {
    return useSWRImmutable<Attributes<Role> | null>(
        () => (roleId != null ? `/roles/${roleId}` : null),
        () => handleAction(getRoleById(roleId!))
    );
}

export function useCreateRoleMutation() {
    return useSWRMutation(
        '/roles/all?',
        (key: string, { arg }: { arg: any }) => handleAction(createRole(arg)),
        {
            revalidate: false,
            populateCache: (newData, currentData) => {
                mutate('/roles/' + newData.id, newData);
                revalidateRoles();
            },
        }
    );
}

export function useUpdateRoleMutation(roleId?: string | null) {
    return useSWRMutation(
        () => (roleId != null ? `/roles/${roleId}` : null),
        (key: string, { arg }: { arg: any }) =>
            handleAction(updateRole(roleId!, arg)),
        {
            onSuccess: () => {
                revalidateRoles();
            },
        }
    );
}
