'use client';

import { useCallback, useEffect } from 'react';
import { useCreateRoleMutation } from '@/lib/roles/hooks';
import PermissionsList from '../../../permissions/PermissionsList';
import { RolePermissionsDefinition } from '@/lib/roles/enums';
import styles from './RoleInfo.module.scss';
import { useForm, Controller } from 'react-hook-form';
import { useConfirmModal } from '../../modals/confirm-modal/Modal';
import { ScrollArea } from 'radix-ui';
import { useRouter } from 'next/navigation';

export default function NewRoleInfo() {
    const router = useRouter();
    const { update } = useConfirmModal();
    const { trigger, isMutating } = useCreateRoleMutation();

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
            router.replace(`/dashboard/roles/${r.id}`);
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
                                            <input type="color" {...field} />
                                        </label>
                                    </div>
                                );
                            }}
                        />
                    </div>
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
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}

// export function NewRoleInfo() {
//     const { update } = useConfirmModal();
//     const { trigger, isMutating } = useCreateRoleMutation();
//     const router = useRouter();
//     const { control, formState, setValue, reset, getValues } = useForm({
//         defaultValues: {
//             name: '',
//             color: '#000000',
//             permissions: '0',
//         },
//     });

//     const onConfirm = useCallback(() => {
//         const values = getValues();
//         trigger({
//             name: values.name,
//             color: values.color,
//             permissions: values.permissions,
//         }).then((r) => {
//             router.push(`/dashboard/roles/${r.id}`);
//         });
//     }, [getValues, router, trigger]);

//     const onCancel = useCallback(() => {
//         reset();
//     }, [reset]);

//     useEffect(() => {
//         update({
//             onConfirm: onConfirm,
//             onCancel: onCancel,
//             isDisabled: !formState.isValid,
//             isLoading: isMutating,
//             isOpen: formState.isDirty,
//         });
//     }, [
//         formState.isDirty,
//         formState.isValid,
//         isMutating,
//         onConfirm,
//         onCancel,
//         update,
//     ]);

//     return (
//         <DashboardLayout.Content>
//             <div className={styles.RoleInfo}>
//                 <h2>New role</h2>
//                 <h3>Name</h3>
//                 <Controller
//                     control={control}
//                     name="name"
//                     rules={{ required: true }}
//                     render={({ field, fieldState }) => {
//                         return (
//                             <div className={styles.RoleInfoName}>
//                                 <input
//                                     type="text"
//                                     {...field}
//                                     aria-invalid={fieldState.error != null}
//                                 />
//                             </div>
//                         );
//                     }}
//                 />
//                 <h3>Color</h3>
//                 <Controller
//                     control={control}
//                     name="color"
//                     render={({ field }) => {
//                         return (
//                             <div className={styles.RoleInfoColor}>
//                                 <label>
//                                     <span style={{ color: field.value }}>
//                                         {field.value}
//                                     </span>
//                                     <input type="color" {...field} />
//                                 </label>
//                             </div>
//                         );
//                     }}
//                 />
//                 <Controller
//                     control={control}
//                     name="permissions"
//                     render={({ field }) => (
//                         <PermissionsList
//                             permissions={field.value}
//                             definition={RolePermissionsDefinition}
//                             onChange={(event) => {
//                                 setValue(
//                                     'permissions',
//                                     String(event.newPermissions),
//                                     {
//                                         shouldDirty: true,
//                                         shouldValidate: true,
//                                     }
//                                 );
//                             }}
//                         />
//                     )}
//                 />
//             </div>
//         </DashboardLayout.Content>
//     );
// }
