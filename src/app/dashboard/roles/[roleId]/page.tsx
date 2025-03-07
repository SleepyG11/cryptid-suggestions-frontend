import { RoleInfo } from '@/components/dashboard/roles/ManageRoles';

export default async function Page({
    params,
}: {
    params: Promise<{ roleId: string }>;
}) {
    const { roleId } = await params;
    return <RoleInfo roleId={roleId} />;
}
