'use client';

import { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './UserInfo.module.scss';
import {
    useUser,
    useUpdateUserPermissionsOverridesMutation,
    useLocalUser,
} from '@/lib/users/hooks';
import _ from 'lodash';
import type ReactSelect from 'react-select';
import OverridePermissionsList from '@/components/permissions/OverridePermissionsList';
import { RolePermissions, RolePermissionsDefinition } from '@/lib/roles/enums';
import { Controller, useForm } from 'react-hook-form';
import { useConfirmModal } from '@/components/dashboard/modals/confirm-modal/Modal';
import { useUpdateUserRoleMutation } from '@/lib/users/hooks';
import { usePublicRoles } from '@/lib/roles/hooks';
import { isUserHasPermissions } from '@/lib/users/utilities';
import { ScrollArea } from 'radix-ui';
import UserCard from '@/components/user/UserCard';
const Select = dynamic(() => import('react-select'), {
    ssr: false,
    loading: () => <div className={styles.ListItem}>Loading...</div>,
}) as ReactSelect;

export default function UserInfo({ userId }: { userId: string }) {
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

    useEffect(() => {
        return () => {
            update({
                onConfirm: null,
                onCancel: null,
                isOpen: false,
            });
        };
    }, [update]);

    return (
        <ScrollArea.Root className={styles.ScrollArea}>
            <ScrollArea.Viewport className={styles.ScrollAreaViewport}>
                <div className={styles.User}>
                    <UserCard.Avatar user={data} size={48} />
                    <div className={styles.UserInfo}>
                        <UserCard.Username user={data} />
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
                                                setValue(
                                                    'roleId',
                                                    option.value,
                                                    {
                                                        shouldDirty: true,
                                                        shouldTouch: true,
                                                    }
                                                );
                                        }}
                                        menuIsOpen={
                                            isLocked ? false : undefined
                                        }
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
                                            singleValue: (
                                                styles,
                                                { data }
                                            ) => ({
                                                ...styles,
                                                color: data.color,
                                                backgroundColor:
                                                    data.color + '40',
                                                width: 'fit-content',
                                                padding: '2px 4px',
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
                </div>
                <div></div>
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
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}
