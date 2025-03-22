import RoleInfo from '@/components/dashboard/sections/roles/RoleInfo';

export default async function Default({
    params,
}: {
    params: Promise<{ roleId: string }>;
}) {
    const { roleId } = await params;
    return <RoleInfo roleId={roleId} />;
}
