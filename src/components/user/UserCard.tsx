import styles from './UserCard.module.scss';
import Image from 'next/image';

export default function UserCard({ user }: { user: any }) {
    return (
        <div className={styles.Card}>
            <span className={styles.CardText}>
                <UserCard.Username user={user} />
                <UserCard.Role user={user} />
            </span>
            <UserCard.Avatar user={user} size={32} />
        </div>
    );
}

UserCard.Avatar = function Avatar({
    user,
    size = 48,
}: {
    user: any;
    size?: number;
}) {
    return (
        <span
            className={styles.AvatarContainer}
            style={{ '--avatar-size': size + 'px' } as React.CSSProperties}
        >
            <Image
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="Avatar"
                className={styles.Avatar}
                width={size}
                height={size}
                loading="lazy"
            />
            {user.decoration && (
                <Image
                    src={`https://cdn.discordapp.com/avatar-decoration-presets/${user.decoration}.png`}
                    alt="Decoration"
                    className={styles.Decoration}
                    width={size * 1.25}
                    height={size * 1.25}
                    loading="lazy"
                />
            )}
        </span>
    );
};
UserCard.Role = function Role({ user }: { user: any }) {
    return (
        <span className={styles.Role} style={{ color: user.role?.color }}>
            [{user.role?.name}]
        </span>
    );
};
UserCard.Username = function Username({ user }: { user: any }) {
    return <span className={styles.Username}>{user.displayName}</span>;
};
