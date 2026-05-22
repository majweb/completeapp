import { usePage, Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { stopImpersonating } from '@/routes/admin';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth } = usePage().props as any;
    const isImpersonating = !!auth.impersonated_by;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {isImpersonating && (
                    <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span>Jesteś zalogowany jako <strong>{auth.user.name}</strong></span>
                        </div>
                        <Link
                            href={stopImpersonating().url}
                            method="post"
                            as="button"
                            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                        >
                            <LogOut className="w-3 h-3" />
                            Wróć do Admina
                        </Link>
                    </div>
                )}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
