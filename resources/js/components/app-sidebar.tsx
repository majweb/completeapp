import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users, ClipboardList, FileText, HardHat } from 'lucide-react';

import { index as clientsIndex } from '@/actions/App/Http/Controllers/ClientController';
import { index as techniciansIndex } from '@/actions/App/Http/Controllers/TechnicianController';
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
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
