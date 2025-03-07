import { RolesList } from '@/components/dashboard/roles/ManageRoles';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <RolesList />
            {children}
        </>
    );
}
