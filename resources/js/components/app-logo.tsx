import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { Auth } from '@/types';

export default function AppLogo() {
    const { auth } = usePage().props as { auth: Auth };
    const company = auth.user?.company;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {company?.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="size-full object-cover" />
                ) : (
                    <AppLogoIcon className="size-5" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {company?.name || 'Zlecenio'}
                </span>
            </div>
        </>
    );
}
