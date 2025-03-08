'use client';

import { usePathname } from 'next/navigation';
import styles from './Navigation.module.scss';
import classNames from 'classnames';
import ConfirmProtectedLink from './components/ConfirmProtectedLink';
import { RolePermissions } from '@/lib/roles/enums';
import { useLocalUser } from '@/lib/users/hooks';
import { isUserHasPermissions } from '@/lib/users/utilities';

const navigationItems = [
    {
        label: 'Users',
        href: '/dashboard/users',
        permissions: [RolePermissions.ManageUsers],
    },
    {
        label: 'Roles',
        href: '/dashboard/roles',
        permissions: [RolePermissions.ManageRoles],
    },
    {
        label: 'Configs',
        href: '/dashboard/configs',
        permissions: [RolePermissions.ManageConfigs],
    },
    {
        label: 'Webhooks',
        href: '/dashboard/webhooks',
        permissions: [RolePermissions.ManageWebhooks],
    },
    {
        label: 'Logs',
        href: '/dashboard/logs',
        permissions: [RolePermissions.ViewLogs],
    },
];

function Item({
    label,
    href,
    permissions,
}: {
    label: string;
    href: string;
    permissions: RolePermissions[];
}) {
    const { data: user } = useLocalUser();
    const pathname = usePathname();

    if (!user || !isUserHasPermissions(user, ...permissions)) return null;

    return (
        <ConfirmProtectedLink
            href={href}
            className={classNames(styles.Item, {
                [styles.Active]: pathname.startsWith(href),
            })}
        >
            {label}
        </ConfirmProtectedLink>
    );
}

export default function DashboardNavigation() {
    return (
        <div className={styles.Navigation}>
            {navigationItems.map((item) => (
                <Item
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    permissions={item.permissions}
                />
            ))}
        </div>
    );
}
