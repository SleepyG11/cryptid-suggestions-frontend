import './dashboard.scss';

import DashboardLayout from '@/components/dashboard/Layout';
import DashboardNavigation from '@/components/dashboard/Navigation';
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout>
            <DashboardLayout.Sidebar>
                <DashboardNavigation />
            </DashboardLayout.Sidebar>
            {children}
        </DashboardLayout>
    );
}
