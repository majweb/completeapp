import { Download } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export function PwaInstallButton() {
    const { isInstallable, install } = usePwaInstall();

    if (!isInstallable) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={install}
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                    <Download className="h-5 w-5" />
                    <span>Zainstaluj aplikację</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
