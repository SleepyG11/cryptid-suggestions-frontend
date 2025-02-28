'use client';

import { createContext, useContext, useState } from 'react';
import styles from './ManageUsers.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';
import { useUsers, useUser } from '@/lib/users/hooks';
import UserCard from '@/components/user/UserCard';

const context = createContext<{
    selectedUserId: number | null;
    setSelectedUserId: (userId: number | null) => void;
}>({
    selectedUserId: null,
    setSelectedUserId: () => {},
});

export function ListItem({ user }: { user: any }) {
    const { selectedUserId, setSelectedUserId } = useContext(context);

    return (
        <div
            className={classNames(styles.ListItem, {
                [styles.Selected]: selectedUserId == user.id,
            })}
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
        >
            <div className={styles.Info}>
                <UserCard.Username user={user} />
                <UserCard.Role user={user} />
            </div>
            <UserCard.Avatar user={user} size={32} />
        </div>
    );
}
export function List() {
    const { data } = useUsers();

    return (
        <div className={styles.List}>
            {data.map((user: any) => (
                <ListItem key={user.id} user={user} />
            ))}
        </div>
    );
}

export function UserInfo() {
    const { selectedUserId } = useContext(context);
    const { data, isLoading } = useUser(selectedUserId ?? undefined);

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>No user selected</div>;

    return (
        <div>
            <div>
                <h1>{data.username}</h1>
                <p>{data.role?.name}</p>
                <p>{data.role?.hexColor}</p>
            </div>
            {/* <PermissionsList
                permissions={data.permissions}
                definition={RolePermissionsDefinition}
            /> */}
        </div>
    );
}

export default function ManageRoles() {
    const [selectedUserId, setSelectedUserId] = useState<any>(null);

    let content;
    if (selectedUserId == -1) {
        content = <div>Create new user</div>;
    } else if (selectedUserId != null) {
        content = <UserInfo />;
    } else {
        content = <div>Skeleton</div>;
    }

    return (
        <context.Provider value={{ selectedUserId, setSelectedUserId }}>
            <DashboardLayout.Sidebar>
                <List />
            </DashboardLayout.Sidebar>
            <DashboardLayout.Content>{content}</DashboardLayout.Content>
        </context.Provider>
    );
}
