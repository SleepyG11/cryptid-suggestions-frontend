'use client';

import { usePathname } from 'next/navigation';
import styles from './Navigation.module.scss';
import classNames from 'classnames';
import Link from 'next/link';

const navigationItems = [
    {
        label: 'Users',
        href: '/dashboard/users',
    },
    {
        label: 'Roles',
        href: '/dashboard/roles',
    },
    {
        label: 'Configs',
        href: '/dashboard/configs',
    },
    {
        label: 'Webhooks',
        href: '/dashboard/webhooks',
    },
    {
        label: 'Logs',
        href: '/dashboard/logs',
    },
];

function Item({ label, href }: { label: string; href: string }) {
    const pathname = usePathname();

    return (
        <Link
            href={href}
            className={classNames(styles.Item, {
                [styles.Active]: pathname === href,
            })}
        >
            {label}
        </Link>
    );
}

export default function DashboardNavigation() {
    return (
        <div className={styles.Navigation}>
            {navigationItems.map((item) => (
                <Item key={item.href} label={item.label} href={item.href} />
            ))}
        </div>
    );
}
