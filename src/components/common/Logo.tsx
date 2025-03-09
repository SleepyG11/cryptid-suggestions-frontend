import Link from 'next/link';
import styles from './Logo.module.scss';
import Image from 'next/image';

export default function Logo({}) {
    return (
        <Link href="/" className={styles.Link}>
            <Logo.Icon />
            <Logo.Label />
        </Link>
    );
}
Logo.Icon = function LogoIcon() {
    return (
        <Image
            src="/images/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className={styles.logo}
        />
    );
};
Logo.Label = function LogoLabel() {
    return <div className={styles.Label}>Cryptid</div>;
};
