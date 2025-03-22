import styles from './Layout.module.scss';

import {
    ConfirmModalProvider,
    ConfirmModal,
} from './modals/confirm-modal/Modal';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ConfirmModalProvider>
            <ConfirmModal />
            <div className={styles.Layout}>{children}</div>
        </ConfirmModalProvider>
    );
}
