import { UsersList } from '@/components/dashboard/users/ManageUsers';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <UsersList />
            {children}
        </>
    );
}
