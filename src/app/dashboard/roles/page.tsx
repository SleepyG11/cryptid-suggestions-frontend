import ConfirmProtectedLink from '@/components/dashboard/components/ConfirmProtectedLink';
import RolesTable from '@/components/dashboard/sections/roles/RolesTable';

export default function Page() {
    return (
        <div className="flex flex-col gap-4 w-full p-8">
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Roles</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <ConfirmProtectedLink href="/dashboard/roles/create">
                        Create Role
                    </ConfirmProtectedLink>
                </div>
            </div>
            <RolesTable />
        </div>
    );
}
