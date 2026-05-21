import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Camera,
    ClipboardCheck,
    LayoutDashboard,
    Rocket,
    ShieldCheck,
    Signature,
    Sparkles,
    Users,
    Zap
} from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="CompleteApp - Nowoczesne Zarządzanie Zleceniami Terenowymi" />

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header/Navbar */}
                <header className="sticky top-0 z-50 border-b border-[#19140015] bg-[#FDFDFC]/80 backdrop-blur-md dark:border-[#3E3E3A]/50 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8 fill-current text-[#f53003] dark:text-[#FF4433]" />
                            <span className="text-xl font-bold tracking-tight">CompleteApp</span>
                        </div>
                        <nav className="flex items-center gap-4 lg:gap-8 text-sm font-medium">
                            <a href="#features" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="hidden hover:text-[#f53003] md:block dark:hover:text-[#FF4433]">Funkcje</a>
                            <a href="#use-cases" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="hidden hover:text-[#f53003] md:block dark:hover:text-[#FF4433]">Branże</a>
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1b1b18] px-5 py-2 text-white hover:bg-[#1b1b18]/90 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white transition-all shadow-sm"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Panel główny</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={login()}
                                        className="rounded-full border border-[#19140015] px-5 py-2 hover:bg-black/5 dark:border-[#3E3E3A] dark:hover:bg-white/5"
                                    >
                                        Zaloguj
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-[#f53003] px-5 py-2 text-white hover:bg-[#f53003]/90 dark:bg-[#FF4433] dark:hover:bg-[#FF4433]/90 transition-all shadow-sm"
                                    >
                                        Darmowe testy
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full bg-[#f53003]/10 px-4 py-1.5 text-sm font-semibold text-[#f53003] ring-1 ring-inset ring-[#f53003]/20 dark:bg-[#FF4433]/10 dark:text-[#FF4433] dark:ring-[#FF4433]/20">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Wsparcie AI już dostępne</span>
                                </div>
                                <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
                                    Zarządzaj serwisem <br />
                                    <span className="bg-gradient-to-r from-[#f53003] to-[#ff750f] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF750F]">
                                        bez papierów
                                    </span>
                                </h1>
                                <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#706f6c] dark:text-[#A1A09A]">
                                    CompleteApp to nowoczesna platforma FSM do zarządzania zleceniami w terenie.
                                    Digitalizuj checklisty, zbieraj podpisy i generuj raporty oparte na AI w kilka sekund.
                                </p>
                                <div className="mt-12 flex items-center justify-center gap-6">
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-[#1b1b18] px-8 py-4 text-base font-semibold text-white shadow-xl hover:bg-[#1b1b18]/90 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white transition-transform hover:scale-105"
                                    >
                                        Rozpocznij teraz
                                    </Link>
                                    <a href="#features" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                    }} className="text-base font-semibold leading-7 flex items-center gap-1 group">
                                        Zobacz funkcje
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl lg:opacity-30 pointer-events-none">
                            <div className="aspect-[1100/600] w-[70rem] bg-gradient-to-tr from-[#f53003] to-[#ffb900] dark:from-[#FF4433] dark:to-[#FFB800] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section id="features" className="py-24 bg-[#F8F8F8] dark:bg-[#121212]/50 ring-1 ring-[#19140005] dark:ring-[#3E3E3A]/20 scroll-mt-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-base font-semibold leading-7 text-[#f53003] dark:text-[#FF4433]">Wszystko czego potrzebujesz</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Nowoczesne narzędzia dla Twojej firmy</p>
                            </div>
                            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                    {[
                                        {
                                            name: 'Zarządzanie Zleceniami',
                                            description: 'Planuj pracę techników, monitoruj statusy i historię napraw w jednym intuicyjnym kalendarzu.',
                                            icon: Briefcase,
                                        },
                                        {
                                            name: 'Cyfrowe Checklisty',
                                            description: 'Twórz dynamiczne szablony dostosowane do specyfiki zleceń. Nigdy więcej pomyłek na miejscu.',
                                            icon: ClipboardCheck,
                                        },
                                        {
                                            name: 'Analiza Raportów AI',
                                            description: 'Nasz asystent AI automatycznie generuje profesjonalne podsumowania z wykonanych prac.',
                                            icon: Sparkles,
                                        },
                                        {
                                            name: 'Dokumentacja Foto',
                                            description: 'Zdjęcia "przed" i "po" z geolokalizacją i znacznikiem czasu jako dowód rzetelności.',
                                            icon: Camera,
                                        },
                                        {
                                            name: 'Podpisy Cyfrowe',
                                            description: 'Zamykaj zlecenia natychmiastowym podpisem klienta bezpośrednio na ekranie telefonu.',
                                            icon: Signature,
                                        },
                                        {
                                            name: 'Pełne Bezpieczeństwo',
                                            description: 'Szyfrowanie danych i zaawansowane uprawnienia (Administrator, Właściciel, Technik).',
                                            icon: ShieldCheck,
                                        },
                                    ].map((feature) => (
                                        <div key={feature.name} className="flex flex-col rounded-2xl bg-white dark:bg-[#161615] p-8 shadow-sm ring-1 ring-[#19140015] dark:ring-[#3E3E3A] hover:ring-[#f53003]/30 dark:hover:ring-[#FF4433]/30 transition-all">
                                            <dt className="flex items-center gap-x-3 text-base font-bold leading-7">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 dark:bg-[#FF4433]/10">
                                                    <feature.icon className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                                </div>
                                                {feature.name}
                                            </dt>
                                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#706f6c] dark:text-[#A1A09A]">
                                                <p className="flex-auto">{feature.description}</p>
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                    </section>

                    {/* Use Cases Section */}
                    <section id="use-cases" className="py-24 scroll-mt-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dla kogo jest CompleteApp?</h2>
                                    <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                        Nasza elastyczność pozwala na wdrożenie systemu w niemal każdej branży serwisowej i instalacyjnej.
                                    </p>
                                    <div className="mt-10 space-y-6 text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {[
                                            { title: 'Serwisy HVAC i Wentylacji', text: 'Regularne przeglądy okresowe z pełną historią.' },
                                            { title: 'Firmy Facility Management', text: 'Koordynacja sprzątania i utrzymania budynków.' },
                                            { title: 'Naprawa Maszyn i Winda', text: 'Wsparcie specjalistycznej dokumentacji technicznej.' },
                                            { title: 'Telekomunikacja i Instalatorzy', text: 'Szybkie protokoły montażu u klienta.' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-[#19140015] dark:hover:border-[#3E3E3A] hover:bg-white dark:hover:bg-white/5 transition-all">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f53003] dark:bg-[#FF4433] text-white text-[10px] font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{item.title}</p>
                                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">{item.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4 pt-12">
                                        <div className="h-64 rounded-2xl bg-gradient-to-br from-[#f53003]/20 to-transparent p-1 flex items-end">
                                            <div className="bg-white dark:bg-[#161615] w-full rounded-xl p-6 shadow-sm border border-[#19140010] dark:border-[#3E3E3A]">
                                                <Users className="h-8 w-8 mb-4 text-[#f53003]" />
                                                <p className="font-bold">Multi-technicy</p>
                                                <p className="text-xs text-[#706f6c]">Zarządzaj zespołami.</p>
                                            </div>
                                        </div>
                                        <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent p-1">
                                            <div className="bg-white dark:bg-[#161615] h-full w-full rounded-xl p-6 shadow-sm border border-[#19140010] dark:border-[#3E3E3A]">
                                                <Rocket className="h-8 w-8 mb-4 text-blue-500" />
                                                <p className="font-bold text-sm tracking-tight">Szybka ścieżka</p>
                                                <div className="mt-2 h-2 w-full bg-blue-100 rounded-full overflow-hidden"><div className="w-[80%] h-full bg-blue-500"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-48 rounded-2xl bg-gradient-to-br from-orange-400/10 to-transparent p-1">
                                            <div className="bg-white dark:bg-[#161615] h-full w-full rounded-xl p-6 shadow-sm border border-[#19140010] dark:border-[#3E3E3A]">
                                                <Zap className="h-8 w-8 mb-4 text-orange-400" />
                                                <p className="font-bold text-sm tracking-tight">Automatyka AI</p>
                                                <p className="text-xs text-[#706f6c] italic line-clamp-2">"Wymieniono filtry, system gotowy..."</p>
                                            </div>
                                        </div>
                                        <div className="h-64 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent p-1">
                                            <div className="bg-white dark:bg-[#161615] h-full w-full rounded-xl p-6 shadow-sm border border-[#19140010] dark:border-[#3E3E3A]">
                                                <ShieldCheck className="h-8 w-8 mb-4 text-green-500" />
                                                <p className="font-bold text-sm">Certyfikowane Raporty</p>
                                                <p className="text-xs text-[#706f6c]">Gwarancja rzetelności.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-24 border-y border-[#19140010] dark:border-[#3E3E3A]/50 bg-white dark:bg-[#161615]">
                        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gotowy na wejście w XXI wiek?</h2>
                            <p className="mt-6 text-lg leading-8 text-[#706f6c] dark:text-[#A1A09A]">
                                Przetestuj CompleteApp całkowicie za darmo przez pierwsze 14 dni. <br className="hidden md:inline" />
                                Bez zobowiązań, bez karty kredytowej na start.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-6">
                                <Link
                                    href={register()}
                                    className="rounded-full bg-[#f53003] px-10 py-5 text-lg font-semibold text-white shadow-xl hover:bg-[#f53003]/90 dark:bg-[#FF4433] transition-all transform hover:scale-105"
                                >
                                    Utwórz darmowe konto
                                </Link>
                                <Link
                                    href={login()}
                                    className="text-base font-semibold leading-7"
                                >
                                    Mam już konto <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-[#19140005] dark:border-[#3E3E3A]/50 bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-50">
                            <AppLogoIcon className="h-5 w-5 fill-current" />
                            <span className="text-sm font-bold tracking-tight">CompleteApp</span>
                        </div>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            © 2026 CompleteApp. System klasy FSM napędzany przez AI. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="flex gap-6">
                            <a href="https://laravel.com/docs" target="_blank" className="text-xs hover:text-[#f53003] transition-colors dark:hover:text-[#FF4433]">Dokumentacja</a>
                            <a href="#" className="text-xs hover:text-[#f53003] transition-colors dark:hover:text-[#FF4433]">Prywatność</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
