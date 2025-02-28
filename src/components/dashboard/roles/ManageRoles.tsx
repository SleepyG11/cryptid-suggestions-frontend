'use client';

import { createContext, useContext, useState } from 'react';
import { useRoles, useRole } from '@/lib/roles/hooks';
import PermissionsList from '../../permissions/PermissionsList';
import { RolePermissions, RolePermissionsDefinition } from '@/lib/roles/enums';
import styles from './ManageRoles.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';

const context = createContext<{
    selectedRoleId: number | null;
    setSelectedRoleId: (roleId: number | null) => void;
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
            <span style={{ color: role.hexColor }}>{role.name}</span>
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
    const { selectedRoleId } = useContext(context);
    const { data, isLoading } = useRole(selectedRoleId ?? undefined);

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>No role selected</div>;

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.hexColor}</p>
            <PermissionsList
                permissions={data.permissions}
                definition={RolePermissionsDefinition}
            />
        </div>
    );
}

export default function ManageRoles() {
    const [selectedRoleId, setSelectedRoleId] = useState<any>(null);

    let content;
    if (selectedRoleId == -1) {
        content = <div>Create new role</div>;
    } else if (selectedRoleId != null) {
        content = <RoleInfo />;
    } else {
        content = <div>Skeleton</div>;
    }

    return (
        <context.Provider value={{ selectedRoleId, setSelectedRoleId }}>
            <DashboardLayout.Sidebar>
                <List />
            </DashboardLayout.Sidebar>
            <DashboardLayout.Content>{content}</DashboardLayout.Content>
        </context.Provider>
    );
}
