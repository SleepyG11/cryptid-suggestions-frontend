import DiscordLoginButton from '../auth/DiscordLoginButton';
import Logo from '../common/Logo';
import styles from './Header.module.scss';
import HeaderNavigation from './Navigation';

export default function Header() {
    return (
        <header className={styles.Header}>
            <div className={styles.Container}>
                <div className={styles.Left}>
                    <Logo />
                </div>
                <div className={styles.Center}>
                    <HeaderNavigation />
                </div>
                <div className={styles.Right}>
                    <DiscordLoginButton />
                </div>
            </div>
        </header>
    );
}
