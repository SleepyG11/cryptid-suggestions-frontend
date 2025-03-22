import RoleInfo from '@/components/dashboard/sections/roles/RoleInfo';
import * as SidePanel from '@/components/dashboard/components/SidePanel';

export default async function Page({
    params,
}: {
    params: Promise<{ roleId: string }>;
}) {
    const { roleId } = await params;

    return (
        <SidePanel.Root>
            <SidePanel.CloseButton />
            <SidePanel.Title>Role Info</SidePanel.Title>
            <SidePanel.Content>
                <RoleInfo roleId={roleId as string} />
            </SidePanel.Content>
        </SidePanel.Root>
    );
}
