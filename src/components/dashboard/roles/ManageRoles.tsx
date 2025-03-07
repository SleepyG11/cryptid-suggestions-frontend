'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
    useRoles,
    useRole,
    useUpdateRoleMutation,
    useCreateRoleMutation,
} from '@/lib/roles/hooks';
import PermissionsList from '../../permissions/PermissionsList';
import { RolePermissionsDefinition } from '@/lib/roles/enums';
import styles from './ManageRoles.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';
import { useForm, Controller } from 'react-hook-form';
import { useConfirmModal } from '../../confirm-modal/Modal';
import _ from 'lodash';
import { useParams, useRouter } from 'next/navigation';

function useSelectedRoleId(): [
    string | null,
    (roleId: string | null, force?: boolean) => void,
] {
    const params = useParams();
    const router = useRouter();
    const { isOpen, setIsShaking } = useConfirmModal();

    const setSelectedRoleId = useCallback(
        (roleId: string | null, force?: boolean) => {
            if (force || !isOpen) {
                router.push(`/dashboard/roles/${roleId}`);
            } else {
                setIsShaking(true);
            }
        },
        [router, isOpen, setIsShaking]
    );

    return [params.roleId as string | null, setSelectedRoleId];
}

export function RolesList() {
    const router = useRouter();
    const [selectedRoleId, setSelectedRoleId] = useSelectedRoleId();
    const [filter, setFilter] = useState('');
    const { data } = useRoles(
        { filter },
        {
            keepPreviousData: true,
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
                <div
                    className={styles.ListItem}
                    onClick={() => router.push('/dashboard/roles/create')}
                >
                    <span style={{ color: '#000000' }}>+ New role</span>
                </div>
                <input
                    className={styles.ListSearch}
                    type="text"
                    placeholder="Search"
                    onChange={(e) => updateFilter(e.target.value)}
                />
                <div className={styles.Separator} />
                {data.map((role: any) => (
                    <div
                        className={classNames(styles.ListItem, {
                            [styles.Selected]: selectedRoleId == role.id,
                        })}
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                    >
                        <span style={{ color: role.color }}>{role.name}</span>
                    </div>
                ))}
            </div>
        </DashboardLayout.Sidebar>
    );
}

export function RoleInfo({ roleId }: { roleId: string }) {
    const { update } = useConfirmModal();
    const { trigger, isMutating } = useUpdateRoleMutation(roleId);
    const { data, isLoading } = useRole(roleId);

    const { control, formState, setValue, reset, getValues } = useForm({
        values: data,
        defaultValues: {
            name: '',
            color: '#000000',
            permissions: '0',
        },
    });

    const onConfirm = useCallback(() => {
        const values = getValues();
        trigger({
            name: values.name,
            color: values.color,
            permissions: values.permissions,
        }).then((r) => {
            reset({
                name: r.name,
                color: r.color,
                permissions: r.permissions,
            });
        });
    }, [getValues, reset, trigger]);

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
            <div
                className={classNames(styles.RoleInfo, {
                    [styles.Loading]: isLoading || isMutating,
                })}
            >
                <h2>Role info</h2>
                <h3>Name</h3>
                <Controller
                    control={control}
                    name="name"
                    rules={{ required: true }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className={styles.RoleInfoName}>
                                <input
                                    type="text"
                                    {...field}
                                    aria-invalid={fieldState.error != null}
                                />
                            </div>
                        );
                    }}
                />
                <h3>Color</h3>
                <Controller
                    control={control}
                    name="color"
                    render={({ field }) => {
                        return (
                            <div className={styles.RoleInfoColor}>
                                <label>
                                    <span style={{ color: field.value }}>
                                        {field.value}
                                    </span>
                                    <input type="color" {...field} />
                                </label>
                            </div>
                        );
                    }}
                />
                <Controller
                    control={control}
                    name="permissions"
                    render={({ field }) => (
                        <PermissionsList
                            permissions={field.value}
                            definition={RolePermissionsDefinition}
                            onChange={(event) => {
                                setValue(
                                    'permissions',
                                    String(event.newPermissions),
                                    {
                                        shouldDirty: true,
                                        shouldValidate: true,
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

export function NewRoleInfo() {
    const { update } = useConfirmModal();
    const { trigger, isMutating } = useCreateRoleMutation();
    const router = useRouter();
    const { control, formState, setValue, reset, getValues } = useForm({
        defaultValues: {
            name: '',
            color: '#000000',
            permissions: '0',
        },
    });

    const onConfirm = useCallback(() => {
        const values = getValues();
        trigger({
            name: values.name,
            color: values.color,
            permissions: values.permissions,
        }).then((r) => {
            router.push(`/dashboard/roles/${r.id}`);
        });
    }, [getValues, router, trigger]);

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
            <div className={styles.RoleInfo}>
                <h2>New role</h2>
                <h3>Name</h3>
                <Controller
                    control={control}
                    name="name"
                    rules={{ required: true }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className={styles.RoleInfoName}>
                                <input
                                    type="text"
                                    {...field}
                                    aria-invalid={fieldState.error != null}
                                />
                            </div>
                        );
                    }}
                />
                <h3>Color</h3>
                <Controller
                    control={control}
                    name="color"
                    render={({ field }) => {
                        return (
                            <div className={styles.RoleInfoColor}>
                                <label>
                                    <span style={{ color: field.value }}>
                                        {field.value}
                                    </span>
                                    <input type="color" {...field} />
                                </label>
                            </div>
                        );
                    }}
                />
                <Controller
                    control={control}
                    name="permissions"
                    render={({ field }) => (
                        <PermissionsList
                            permissions={field.value}
                            definition={RolePermissionsDefinition}
                            onChange={(event) => {
                                setValue(
                                    'permissions',
                                    String(event.newPermissions),
                                    {
                                        shouldDirty: true,
                                        shouldValidate: true,
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
