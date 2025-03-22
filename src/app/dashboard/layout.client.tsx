'use client';

import { useLocalUser } from '@/lib/users/hooks';
import { useRouter } from 'next/navigation';
import * as Sidebar from '@/components/dashboard/components/Sidebar';
import Logo from '@/components/common/Logo';
import DiscordLoginButton from '@/components/auth/DiscordLoginButton';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/Layout';

export default function LayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: localUser, isLoading } = useLocalUser();

    if (!isLoading && !localUser) {
        router.replace('/');
        return null;
    }

    return (
        <DashboardLayout>
            <Sidebar.Root>
                <Sidebar.Column>
                    <Sidebar.Top>
                        <Logo />
                    </Sidebar.Top>
                    <Sidebar.Center>
                        <Sidebar.Group>
                            <Sidebar.GroupTitle>Users</Sidebar.GroupTitle>
                            <Sidebar.GroupItems>
                                <Link href="/dashboard/users">
                                    <Sidebar.GroupItem
                                        activePathnameRegex={
                                            /^\/dashboard\/users/
                                        }
                                    >
                                        Users
                                    </Sidebar.GroupItem>
                                </Link>
                                <Link href="/dashboard/roles">
                                    <Sidebar.GroupItem
                                        activePathnameRegex={
                                            /^\/dashboard\/roles/
                                        }
                                    >
                                        Roles
                                    </Sidebar.GroupItem>
                                </Link>
                            </Sidebar.GroupItems>
                        </Sidebar.Group>
                        <Sidebar.Group>
                            <Sidebar.GroupTitle>
                                Integrations
                            </Sidebar.GroupTitle>
                            <Sidebar.GroupItems>
                                <Sidebar.GroupItem>Webhooks</Sidebar.GroupItem>
                            </Sidebar.GroupItems>
                        </Sidebar.Group>
                        <Sidebar.Separator />
                        <Sidebar.Group>
                            <Sidebar.GroupTitle>Admin</Sidebar.GroupTitle>
                            <Sidebar.GroupItems>
                                <Link href="/dashboard/configs">
                                    <Sidebar.GroupItem
                                        activePathnameRegex={
                                            /^\/dashboard\/configs/
                                        }
                                    >
                                        Configs
                                    </Sidebar.GroupItem>
                                </Link>
                                <Sidebar.GroupItem>Logs</Sidebar.GroupItem>
                            </Sidebar.GroupItems>
                        </Sidebar.Group>
                    </Sidebar.Center>
                    <Sidebar.Bottom>
                        <DiscordLoginButton />
                    </Sidebar.Bottom>
                </Sidebar.Column>
            </Sidebar.Root>
            {children}
        </DashboardLayout>
    );
}
