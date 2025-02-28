'use client';

import { logout } from '@/lib/discord-oauth2/actions';
import { useLocalUser } from '@/lib/users/hooks';
import { DISCORD_OAUTH2_LOGIN_URL } from '@/lib/discord-oauth2/constants';

import styles from './DiscordLoginButton.module.scss';
import UserCard from '../user/UserCard';

export default function DiscordLoginButton() {
    const { data: localUser, isLoading, mutate } = useLocalUser();

    console.log(localUser);

    if (localUser)
        return (
            <span className={styles.Logged}>
                <UserCard user={localUser} />
                <button
                    onClick={() =>
                        logout().then(() =>
                            mutate(undefined, { revalidate: false })
                        )
                    }
                >
                    Logout
                </button>
            </span>
        );

    if (isLoading) return <span className={styles.Loading}>Loading...</span>;

    return (
        <a href={DISCORD_OAUTH2_LOGIN_URL} className={styles.Login}>
            Login with Discord
        </a>
    );
}
