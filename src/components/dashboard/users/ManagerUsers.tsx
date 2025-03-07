'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './ManageUsers.module.scss';
import classNames from 'classnames';
import DashboardLayout from '../Layout';
import { getPublicRoles } from '@/lib/roles/actions';
import { useUsers, useUser } from '@/lib/users/hooks';
import UserCard from '@/components/user/UserCard';
import _ from 'lodash';
import { handleAction } from '@/lib/common/actionResponse';
import type AsyncReactSelect from 'react-select/async';
import { useRouter, useParams } from 'next/navigation';
import { useConfirmModal } from '@/components/confirm-modal/Modal';
const AsyncSelect = dynamic(() => import('react-select/async'), {
    ssr: false,
    loading: () => <div className={styles.ListItem}>Loading...</div>,
}) as AsyncReactSelect;

// -----------

function useSelectedUserId(): [
    string | undefined,
    (userId: string, force?: boolean) => void,
] {
    const { isOpen, setIsShaking } = useConfirmModal();
    const params = useParams();
    const router = useRouter();

    const setSelectedUserId = useCallback(
        (userId: string, force?: boolean) => {
            if (force || !isOpen) {
                router.push(`/dashboard/users/${userId}`);
            } else {
                setIsShaking(true);
            }
        },
        [router, isOpen, setIsShaking]
    );

    return [params.userId as string | undefined, setSelectedUserId];
}

// -----------

function ListItem({ user }: { user: any }) {
    const [selectedUserId, setSelectedUserId] = useSelectedUserId();

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

// -----------

export function UsersList() {
    const [filter, setFilter] = useState('');
    const [roles, setRoles] = useState<string[]>([]);
    const { data } = useUsers(
        { filter, roles },
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
                    <ListItem key={user.id} user={user} />
                ))}
            </div>
        </DashboardLayout.Sidebar>
    );
}

export function UserInfo({ userId }: { userId: string }) {
    const { data } = useUser(userId);

    return (
        <DashboardLayout.Content>
            <div>
                <div>
                    <h1>{data?.username}</h1>
                    <p>{data?.role?.name}</p>
                    <p>{data?.role?.color}</p>
                </div>
                {/* <PermissionsList
                permissions={data.permissions}
                definition={RolePermissionsDefinition}
            /> */}
            </div>
        </DashboardLayout.Content>
    );
}
