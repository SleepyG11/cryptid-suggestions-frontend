import UserInfo from '@/components/dashboard/sections/users/UserInfo';
import * as SidePanel from '@/components/dashboard/components/SidePanel';

export default async function Page({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    return (
        <SidePanel.Root>
            <SidePanel.CloseButton />
            <SidePanel.Title>User Info</SidePanel.Title>
            <SidePanel.Content>
                <UserInfo userId={userId as string} />
            </SidePanel.Content>
        </SidePanel.Root>
    );
}
