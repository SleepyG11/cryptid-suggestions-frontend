import styles from './Layout.module.scss';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className={styles.Layout}>{children}</div>;
}

DashboardLayout.Sidebar = function Sidebar({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className={styles.Sidebar}>{children}</div>;
};

DashboardLayout.Content = function Content({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.Content}>
            <div className={styles.ScrollContent}>{children}</div>
        </div>
    );
};
