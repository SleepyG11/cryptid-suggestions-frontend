import { UserInfo } from '@/components/dashboard/users/ManageUsers';

export default async function Page({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    return <UserInfo userId={userId} />;
}
