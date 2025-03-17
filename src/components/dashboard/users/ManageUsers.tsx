'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './ManageUsers.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';
import {
    useUsers,
    useUser,
    useUpdateUserPermissionsOverridesMutation,
    useLocalUser,
} from '@/lib/users/hooks';
import UserCard from '@/components/user/UserCard';
import _ from 'lodash';
import type ReactSelect from 'react-select';
import { useParams, useRouter } from 'next/navigation';
import ConfirmProtectedLink from '../components/ConfirmProtectedLink';
import OverridePermissionsList from '@/components/permissions/OverridePermissionsList';
import { RolePermissions, RolePermissionsDefinition } from '@/lib/roles/enums';
import { Controller, useForm } from 'react-hook-form';
import { useConfirmModal } from '@/components/confirm-modal/Modal';
import { useUpdateUserRoleMutation } from '@/lib/users/hooks';
import { usePublicRoles } from '@/lib/roles/hooks';
import { isUserHasPermissions } from '@/lib/users/utilities';
const Select = dynamic(() => import('react-select'), {
    ssr: false,
    loading: () => <div className={styles.ListItem}>Loading...</div>,
}) as ReactSelect;

// -----------

export function UsersList() {
    const params = useParams();
    const router = useRouter();
    const [filter, setFilter] = useState('');
    const { data: rolesList, isLoading: isRolesLoading } = usePublicRoles();
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
                <Select
                    id={'user-roles-search'}
                    isLoading={isRolesLoading}
                    options={rolesList?.map((role: any) => ({
                        value: role.id,
                        label: role.name,
                        color: role.color,
                    }))}
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
                        multiValue: (styles, { data }) => ({
                            ...styles,
                            backgroundColor: data.color + '30',
                        }),
                        multiValueLabel: (styles, { data }) => ({
                            ...styles,
                            color: data.color,
                        }),
                    }}
                    closeMenuOnSelect={false}
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
    const { data: localUser } = useLocalUser();
    const { update, isOpen: isConfirmModalOpen } = useConfirmModal();
    const { data: roles, isLoading: isRolesLoading } = usePublicRoles();
    const { data } = useUser(userId);
    const { trigger: triggerPermissions, isMutating: isMutatingPermissions } =
        useUpdateUserPermissionsOverridesMutation(userId);
    const { trigger: triggerRole, isMutating: isMutatingRole } =
        useUpdateUserRoleMutation(userId);

    const isMutating = isMutatingPermissions || isMutatingRole;

    const values = data && {
        roleId: data.roleId,
        permissions: {
            allow: data.allowPermissionsOverride,
            deny: data.denyPermissionsOverride,
        },
    };

    const { control, formState, setValue, reset, getValues, getFieldState } =
        useForm({
            values,
            defaultValues: {
                roleId: '0',
                permissions: {
                    allow: '0',
                    deny: '0',
                },
            },
        });

    const onConfirm = useCallback(() => {
        const values = getValues();
        const permissionsFieldState = getFieldState('permissions');
        if (permissionsFieldState.isDirty) {
            return triggerPermissions({
                allow: values.permissions.allow,
                deny: values.permissions.deny,
            });
        }
        const rolesFieldState = getFieldState('roleId');
        if (rolesFieldState.isDirty) {
            return triggerRole(values.roleId);
        }
    }, [getValues, getFieldState, triggerPermissions, triggerRole]);

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
                </div>
                <div>
                    <Controller
                        control={control}
                        name="roleId"
                        render={({ field, fieldState }) => {
                            const isLocked =
                                !fieldState.isDirty && isConfirmModalOpen;

                            const currentRole =
                                values &&
                                roles?.find(
                                    (role: any) => role.id == field.value
                                );

                            const currentRoleOption = currentRole
                                ? {
                                      value: currentRole.id,
                                      label: currentRole.name,
                                      color: currentRole.color,
                                  }
                                : {
                                      value: '0',
                                      label: '',
                                      color: '',
                                  };

                            return (
                                <Select
                                    id={'user-roles-search'}
                                    isLoading={isRolesLoading}
                                    options={roles?.map((role: any) => ({
                                        value: role.id,
                                        label: role.name,
                                        color: role.color,
                                    }))}
                                    placeholder="User role"
                                    value={currentRoleOption}
                                    onChange={(option) => {
                                        if (isLocked)
                                            return update({
                                                isShaking: true,
                                            });
                                        if (option)
                                            setValue('roleId', option.value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                            });
                                    }}
                                    menuIsOpen={isLocked ? false : undefined}
                                    onMenuOpen={() => {
                                        if (isLocked)
                                            return update({
                                                isShaking: true,
                                            });
                                    }}
                                    styles={{
                                        option: (styles, { data }) => ({
                                            ...styles,
                                            color: data.color,
                                        }),
                                        singleValue: (styles, { data }) => ({
                                            ...styles,
                                            color: data.color,
                                            backgroundColor: data.color + '30',
                                            width: 'fit-content',
                                            padding: '4px',
                                        }),
                                    }}
                                    isDisabled={
                                        !isUserHasPermissions(
                                            localUser,
                                            RolePermissions.ManageUserRolesAndPermissions
                                        )
                                    }
                                />
                            );
                        }}
                    />
                </div>
                <Controller
                    control={control}
                    name="permissions"
                    render={({ field, fieldState }) => (
                        <OverridePermissionsList
                            isRoot={data?.root}
                            permissions={field.value}
                            definition={RolePermissionsDefinition}
                            readOnly={
                                !isUserHasPermissions(
                                    localUser,
                                    RolePermissions.ManageUserRolesAndPermissions
                                )
                            }
                            onChange={(event) => {
                                if (!fieldState.isDirty && isConfirmModalOpen)
                                    return update({
                                        isShaking: true,
                                    });
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
