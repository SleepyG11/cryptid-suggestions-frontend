'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRole, useUpdateRoleMutation } from '@/lib/roles/hooks';
import PermissionsList from '../../../permissions/PermissionsList';
import styles from './RoleInfo.module.scss';
import { useForm, Controller } from 'react-hook-form';
import { useConfirmRequestMethods } from '@/lib/confirm-queue/context';
import { ScrollArea } from 'radix-ui';

export default function RoleInfo({ roleId }: { roleId: string }) {
    const { update } = useConfirmRequestMethods('role-info');
    const { trigger, isMutating } = useUpdateRoleMutation(roleId);
    const { data } = useRole(roleId);

    const { control, formState, setValue, reset, getValues, watch } = useForm({
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

    const permissions = watch('permissions');
    const list = useMemo(() => {
        return (
            <PermissionsList
                permissions={permissions}
                onChange={(event) => {
                    setValue('permissions', String(event.newPermissions), {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }}
            />
        );
    }, [permissions, setValue]);

    return (
        <ScrollArea.Root className={styles.ScrollArea}>
            <ScrollArea.Viewport className={styles.ScrollAreaViewport}>
                <div className={styles.RoleInfo}>
                    <div className={styles.RoleInfoHeader}>
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
                                            aria-invalid={
                                                fieldState.error != null
                                            }
                                            placeholder="Role name"
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            control={control}
                            name="color"
                            render={({ field }) => {
                                return (
                                    <div className={styles.RoleInfoColor}>
                                        <label>
                                            <span
                                                style={{ color: field.value }}
                                            >
                                                {field.value}
                                            </span>
                                            <input type="color" {...field} />
                                        </label>
                                    </div>
                                );
                            }}
                        />
                    </div>
                    {list}
                </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}
