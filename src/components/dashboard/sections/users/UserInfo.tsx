'use client';

import { useCallback, useEffect, useMemo } from 'react';
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
import { RolePermissions } from '@/lib/roles/enums';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { useUpdateUserRoleMutation } from '@/lib/users/hooks';
import { usePublicRoles } from '@/lib/roles/hooks';
import { isUserHasPermissions } from '@/lib/users/utilities';
import { ScrollArea } from 'radix-ui';
import UserCard from '@/components/user/UserCard';
import { useConfirmRequestMethods } from '@/lib/confirm-queue/context';

const Select = dynamic(() => import('react-select'), {
    ssr: false,
    loading: () => <div className={styles.ListItem}>Loading...</div>,
}) as ReactSelect;

function UserRoleSelect({ user }: { user: any }) {
    const form = useFormContext();
    const { data: localUser } = useLocalUser();
    const { data: roles, isLoading: isRolesLoading } = usePublicRoles();

    const currentRole =
        form.getValues('roleId') &&
        roles?.find((role: any) => role.id == form.getValues('roleId'));

    let currentRoleOption;
    if (currentRole) {
        currentRoleOption = {
            value: currentRole.id,
            label: currentRole.name,
            color: currentRole.color,
        };
    } else {
        currentRoleOption = {
            value: '0',
            label: '',
            color: '',
        };
    }

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
                if (option)
                    form.setValue('roleId', option.value, {
                        shouldDirty: true,
                        shouldTouch: true,
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
                    backgroundColor: data.color + '40',
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
}
function UserPermissionsList({ user }: { user: any }) {
    const { setValue, watch } = useFormContext();
    const { data: localUser } = useLocalUser();

    const permissions = watch('permissions');
    const list = useMemo(() => {
        return (
            <OverridePermissionsList
                isRoot={user?.root}
                permissions={permissions}
                readOnly={
                    !isUserHasPermissions(
                        localUser,
                        RolePermissions.ManageUserRolesAndPermissions
                    )
                }
                onChange={(event) => {
                    setValue(
                        'permissions',
                        {
                            allow: String(event.newPermissions.allow),
                            deny: String(event.newPermissions.deny),
                        },
                        {
                            shouldDirty: true,
                            shouldTouch: true,
                        }
                    );
                }}
            />
        );
    }, [user, permissions, setValue, localUser]);

    return list;
}

export default function UserInfo({ userId }: { userId: string }) {
    const { update } = useConfirmRequestMethods('user-info');
    const { data } = useUser(userId);
    const { trigger: triggerPermissions, isMutating: isMutatingPermissions } =
        useUpdateUserPermissionsOverridesMutation(userId);
    const { trigger: triggerRole, isMutating: isMutatingRole } =
        useUpdateUserRoleMutation(userId);

    const isMutating = isMutatingPermissions || isMutatingRole;

    const form = useForm({
        values: data && {
            roleId: data.roleId,
            permissions: {
                allow: data.allowPermissionsOverride,
                deny: data.denyPermissionsOverride,
            },
        },
        defaultValues: {
            roleId: '0',
            permissions: {
                allow: '0',
                deny: '0',
            },
        },
    });
    const { formState, reset, getValues, getFieldState } = form;

    const onConfirm = useCallback(async () => {
        const values = getValues();
        const permissionsFieldState = getFieldState('permissions');
        if (permissionsFieldState.isDirty) {
            await triggerPermissions({
                allow: values.permissions.allow,
                deny: values.permissions.deny,
            });
        }
        const rolesFieldState = getFieldState('roleId');
        if (rolesFieldState.isDirty) {
            await triggerRole(values.roleId);
        }
        reset();
    }, [getValues, getFieldState, triggerPermissions, triggerRole, reset]);

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
        <FormProvider {...form}>
            <ScrollArea.Root className={styles.ScrollArea}>
                <ScrollArea.Viewport className={styles.ScrollAreaViewport}>
                    <div className={styles.User}>
                        <UserCard.Avatar user={data} size={48} />
                        <div className={styles.UserInfo}>
                            <UserCard.Username user={data} />
                            <UserRoleSelect user={data} />
                        </div>
                    </div>
                    <div></div>
                    <UserPermissionsList user={data} />
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical">
                    <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        </FormProvider>
    );
}
