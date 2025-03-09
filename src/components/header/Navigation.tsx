'use client';

import Link from 'next/link';
import styles from './Navigation.module.scss';
import { useLocalUser } from '@/lib/users/hooks';

const links = [
    {
        label: 'Home',
        href: '/',
    },
    {
        label: 'Jokers',
        href: '/jokers',
    },
    {
        label: 'Gamesets',
        href: '/gamesets',
    },
    {
        label: 'Developers',
        href: '/developers',
    },
    {
        label: 'Download',
        href: '/download',
    },
    {
        label: 'Dashboard',
        href: '/dashboard',
        requiresAuth: true,
    },
];

export default function HeaderNavigation() {
    const { data: user } = useLocalUser();

    return (
        <nav className={styles.Nav}>
            <ul>
                {links.map((link) => {
                    if (link.requiresAuth && !user) return null;
                    return (
                        <li key={link.href}>
                            <Link href={link.href}>{link.label}</Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
