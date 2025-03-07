import { UsersList } from '@/components/dashboard/users/ManagerUsers';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <UsersList />
            {children}
        </>
    );
}
