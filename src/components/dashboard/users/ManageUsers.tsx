'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './ManageUsers.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';
import { getPublicRoles } from '@/lib/roles/actions';
import {
    useUsers,
    useUser,
    useUpdateUserPermissionsOverridesMutation,
} from '@/lib/users/hooks';
import UserCard from '@/components/user/UserCard';
import _ from 'lodash';
import { handleAction } from '@/lib/common/actionResponse';
import type AsyncReactSelect from 'react-select/async';
import { useParams, useRouter } from 'next/navigation';
import ConfirmProtectedLink from '../components/ConfirmProtectedLink';
import OverridePermissionsList from '@/components/permissions/OverridePermissionsList';
import { RolePermissionsDefinition } from '@/lib/roles/enums';
import { Controller, useForm } from 'react-hook-form';
import { useConfirmModal } from '@/components/confirm-modal/Modal';
const AsyncSelect = dynamic(() => import('react-select/async'), {
    ssr: false,
    loading: () => <div className={styles.ListItem}>Loading...</div>,
}) as AsyncReactSelect;

// -----------

export function UsersList() {
    const params = useParams();
    const router = useRouter();
    const [filter, setFilter] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const { data, mutate } = useUsers(
        { filter, roles },
        {
            keepPreviousData: true,
            onError(err, key, config) {
                if (err.status === 403) {
                    router.replace('/dashboard');
                    mutate(undefined);
                }
            },
        }
    );

    const updateFilter = useMemo(
        () =>
            _.debounce((value: string) => {
                setFilter(value);
            }, 300),
        [setFilter]
    );

    return (
        <DashboardLayout.Sidebar>
            <div className={styles.List}>
                <input
                    className={styles.ListSearch}
                    type="text"
                    placeholder="Search"
                    onChange={(e) => updateFilter(e.target.value)}
                />
                <AsyncSelect
                    id={'user-roles-search'}
                    loadOptions={async () => {
                        const roles = await handleAction(getPublicRoles());
                        return roles.map((role: any) => ({
                            value: role.id,
                            label: role.name,
                            color: role.color,
                        }));
                    }}
                    defaultOptions
                    cacheOptions
                    isMulti
                    placeholder="With roles..."
                    onChange={(options) => {
                        setRoles(
                            options?.map((option: any) =>
                                String(option.value)
                            ) ?? []
                        );
                    }}
                    styles={{
                        option: (styles, { data }) => ({
                            ...styles,
                            color: data.color,
                        }),
                    }}
                />
                <div className={styles.Separator} />
                {data.map((user: any) => (
                    <ConfirmProtectedLink
                        className={classNames(styles.ListItem, {
                            [styles.Selected]: params.userId == user.id,
                        })}
                        key={user.id}
                        href={`/dashboard/users/${user.id}`}
                    >
                        <div className={styles.Info}>
                            <UserCard.Username user={user} />
                            <UserCard.Role user={user} />
                        </div>
                        <UserCard.Avatar user={user} size={32} />
                    </ConfirmProtectedLink>
                ))}
            </div>
        </DashboardLayout.Sidebar>
    );
}

export function UserInfo({ userId }: { userId: string }) {
    const { update } = useConfirmModal();
    const { data } = useUser(userId);
    const { trigger, isMutating } =
        useUpdateUserPermissionsOverridesMutation(userId);

    const values = data && {
        permissions: {
            allow: data.allowPermissionsOverride,
            deny: data.denyPermissionsOverride,
        },
    };

    const { control, formState, setValue, reset, getValues } = useForm({
        values,
        defaultValues: {
            permissions: {
                allow: '0',
                deny: '0',
            },
        },
    });

    const onConfirm = useCallback(() => {
        const values = getValues();
        trigger({
            allow: values.permissions.allow,
            deny: values.permissions.deny,
        });
    }, [getValues, trigger]);

    const onCancel = useCallback(() => {
        reset();
    }, [reset]);

    useEffect(() => {
        update({
            onConfirm: onConfirm,
            onCancel: onCancel,
            isDisabled: !formState.isValid,
            isLoading: isMutating,
            isOpen: formState.isDirty,
        });
    }, [
        formState.isDirty,
        formState.isValid,
        isMutating,
        onConfirm,
        onCancel,
        update,
    ]);

    return (
        <DashboardLayout.Content>
            <div>
                <div>
                    <h1>{data?.username}</h1>
                    <p>{data?.role?.name}</p>
                    <p>{data?.role?.color}</p>
                </div>
                <Controller
                    control={control}
                    name="permissions"
                    render={({ field }) => (
                        <OverridePermissionsList
                            permissions={field.value}
                            definition={RolePermissionsDefinition}
                            onChange={(event) => {
                                setValue(
                                    'permissions',
                                    {
                                        allow: String(
                                            event.newPermissions.allow
                                        ),
                                        deny: String(event.newPermissions.deny),
                                    },
                                    {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                    }
                                );
                            }}
                        />
                    )}
                />
            </div>
        </DashboardLayout.Content>
    );
}
