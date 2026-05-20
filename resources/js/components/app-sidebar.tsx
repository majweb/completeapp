import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, ClipboardList, FileText, HardHat } from 'lucide-react';
import { index as clientsIndex } from '@/actions/App/Http/Controllers/ClientController';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as jobTemplatesIndex } from '@/routes/job-templates';
import { index as jobsIndex } from '@/routes/jobs';
import { index as techniciansIndexRoute } from '@/routes/technicians';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Zlecenia',
            href: jobsIndex(),
            icon: ClipboardList,
        },
    ];

    if (user.role === 'owner' || user.role === 'manager') {
        mainNavItems.push(
            {
                title: 'Szablony zleceń',
                href: jobTemplatesIndex(),
                icon: FileText,
            },
            {
                title: 'Ekipa (Technicy)',
                href: techniciansIndexRoute(),
                icon: HardHat,
            },
            {
                title: 'Klienci',
                href: clientsIndex.url(),
                icon: Users,
            }
        );
    } else if (user.role === 'technician') {
        // Technicians can also see clients (view only)
        mainNavItems.push({
            title: 'Klienci',
            href: clientsIndex.url(),
            icon: Users,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
