import UserInfo from '@/components/dashboard/sections/users/UserInfo';

export default async function Default({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    return <UserInfo userId={userId} />;
}
