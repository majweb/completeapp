import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, ClipboardList, FileText, HardHat, Settings, CreditCard, Info } from 'lucide-react';
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
import { dashboard, rolesGuide } from '@/routes';
import { edit as companySettingsRoute } from '@/routes/company';
import { index as jobTemplatesIndex } from '@/routes/job-templates';
import { index as jobsIndex } from '@/routes/jobs';
import { index as subscriptionIndex } from '@/routes/subscription';
import { index as technicianIndex } from '@/routes/technicians';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth, isFreeMode } = usePage().props as any;
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
        {
            title: 'Przewodnik po rolach',
            href: rolesGuide(),
            icon: Info,
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
                href: technicianIndex(),
                icon: HardHat,
            },
            {
                title: 'Klienci',
                href: clientsIndex.url(),
                icon: Users,
            }
        );

        if (user.role === 'owner') {
            mainNavItems.push({
                title: 'Ustawienia firmy',
                href: companySettingsRoute.url(),
                icon: Settings,
            });

            if (!isFreeMode) {
                mainNavItems.push({
                    title: 'Subskrypcja',
                    href: subscriptionIndex(),
                    icon: CreditCard,
                });
            }
        }
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
                            <Link href={dashboard()}>
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
