import styles from './Layout.module.scss';

import { ConfirmModal } from './modals/confirm-modal/Modal';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ConfirmModal />
            <div className={styles.Layout}>{children}</div>
        </>
    );
}
