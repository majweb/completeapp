import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Ustawienia wyglądu" />

            <h1 className="sr-only">Ustawienia wyglądu</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Ustawienia wyglądu"
                    description="Zaktualizuj ustawienia wyglądu swojego konta"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Ustawienia wyglądu',
            href: editAppearance(),
        },
    ],
};
