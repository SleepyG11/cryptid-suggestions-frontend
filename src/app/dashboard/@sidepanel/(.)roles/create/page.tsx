import * as SidePanel from '@/components/dashboard/components/SidePanel';
import NewRoleInfo from '@/components/dashboard/sections/roles/NewRoleInfo';

export default async function Page() {
    return (
        <SidePanel.Root>
            <SidePanel.CloseButton />
            <SidePanel.Title>Create role</SidePanel.Title>
            <SidePanel.Content>
                <NewRoleInfo />
            </SidePanel.Content>
        </SidePanel.Root>
    );
}
