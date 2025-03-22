import UsersTable from '@/components/dashboard/sections/users/UsersTable';

export default function Page() {
    return (
        <div className="flex flex-col gap-4 w-full p-8">
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Users</h1>
                </div>
            </div>
            <UsersTable />
        </div>
    );
}
