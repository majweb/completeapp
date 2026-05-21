import { Link, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

interface SharedProps {
    subscription?: {
        exceedsTechniciansLimit: boolean;
        exceedsJobsLimit: boolean;
    };
    [key: string]: any;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { subscription } = usePage<SharedProps>().props;

    const hasLimitExceeded = subscription?.exceedsTechniciansLimit || subscription?.exceedsJobsLimit;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {hasLimitExceeded && (
                <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full border border-destructive/20 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Przekroczono limity planu!</span>
                    <Link href="/subscription" className="underline font-bold ml-1">
                        Zmień plan
                    </Link>
                </div>
            )}
        </header>
    );
}
