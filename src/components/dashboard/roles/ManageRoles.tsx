'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from 'react';
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

const context = createContext<{
    selectedRoleId: number | null;
    setSelectedRoleId: (roleId: number | null, force?: boolean) => void;
}>({
    selectedRoleId: null,
    setSelectedRoleId: () => {},
});

export function ListItem({ role }: { role: any }) {
    const { selectedRoleId, setSelectedRoleId } = useContext(context);
    return (
        <div
            className={classNames(styles.ListItem, {
                [styles.Selected]: selectedRoleId == role.id,
            })}
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
        >
            <span style={{ color: role.color }}>{role.name}</span>
        </div>
    );
}
export function List() {
    const { setSelectedRoleId } = useContext(context);
    const { data } = useRoles();

    return (
        <div className={styles.List}>
            <div
                className={styles.ListItem}
                onClick={() => setSelectedRoleId(-1)}
            >
                <span style={{ color: '#000000' }}>+ New role</span>
            </div>
            <div className={styles.Separator} />
            {data.map((role: any) => (
                <ListItem key={role.id} role={role} />
            ))}
        </div>
    );
}

export function RoleInfo() {
    const { update } = useConfirmModal();
    const { selectedRoleId } = useContext(context);
    const { trigger, isMutating } = useUpdateRoleMutation(selectedRoleId);
    const { data, isLoading } = useRole(selectedRoleId);

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
    );
}

export function NewRoleInfo() {
    const { update } = useConfirmModal();
    const { setSelectedRoleId } = useContext(context);
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
            setSelectedRoleId(r.id, true);
        });
    }, [getValues, setSelectedRoleId, trigger]);

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
    );
}

export default function ManageRoles() {
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const { checkIsTaken } = useConfirmModal();

    let content;
    if (selectedRoleId == -1) {
        content = <NewRoleInfo />;
    } else if (selectedRoleId != null) {
        content = <RoleInfo key={selectedRoleId} />;
    } else {
        content = <div>Skeleton</div>;
    }

    const selectRoleId = useMemo(() => {
        return (roleId: number | null, force?: boolean) => {
            if (!force && checkIsTaken()) return;
            setSelectedRoleId(roleId);
        };
    }, [checkIsTaken, setSelectedRoleId]);

    return (
        <context.Provider
            value={{
                selectedRoleId,
                setSelectedRoleId: selectRoleId,
            }}
        >
            <DashboardLayout.Sidebar>
                <List />
            </DashboardLayout.Sidebar>
            <DashboardLayout.Content>{content}</DashboardLayout.Content>
        </context.Provider>
    );
}
