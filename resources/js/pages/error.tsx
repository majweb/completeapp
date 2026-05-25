import { Head, Link } from '@inertiajs/react';
import { Home, AlertTriangle, ShieldAlert, FileQuestion, ServerCrash, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    status: number;
}

export default function Error({ status }: ErrorProps) {
    const title = {
        503: '503: Usługa niedostępna',
        500: '500: Błąd serwera',
        404: '404: Nie odnaleziono strony',
        403: '403: Brak dostępu',
    }[status] || 'Wystąpił błąd';

    const description = {
        503: 'Przepraszamy, prowadzimy obecnie prace konserwacyjne. Zapraszamy wkrótce.',
        500: 'Ojej, coś poszło nie tak na naszych serwerach. Pracujemy nad tym!',
        404: 'Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.',
        403: 'Przepraszamy, nie masz uprawnień do przeglądania tej strony.',
    }[status] || 'Wystąpił nieoczekiwany błąd.';

    const Icon = {
        503: Construction,
        500: ServerCrash,
        404: FileQuestion,
        403: ShieldAlert,
    }[status] || AlertTriangle;

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-2xl bg-[#f53003]/10 p-4 dark:bg-[#FF4433]/10">
                            <Icon className="h-12 w-12 text-[#f53003] dark:text-[#FF4433]" />
                        </div>
                    </div>

                    <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        {status}
                    </h1>

                    <p className="mb-8 text-lg text-[#1b1b18]/60 dark:text-[#EDEDEC]/60">
                        {description}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild className="rounded-full bg-[#f53003] px-8 py-6 text-base font-medium text-white hover:bg-[#f53003]/90 dark:bg-[#FF4433] dark:hover:bg-[#FF4433]/90">
                            <Link href="/">
                                <Home className="mr-2 h-5 w-5" />
                                Wróć do strony głównej
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-12">
                        <img src="/logo-full-croped.png" alt="Zlecenio" className="mx-auto h-8 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </>
    );
}
