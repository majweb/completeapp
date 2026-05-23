import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Camera,
    ClipboardCheck,
    Download,
    LayoutDashboard,
    Rocket,
    ShieldCheck,
    Signature,
    Sparkles,
    Users,
    Zap
} from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const { isInstallable, install } = usePwaInstall();

    return (
        <>
            <Head>
                <title>Zlecenio - Nowoczesne Zarządzanie Zleceniami Terenowymi</title>
                <meta name="description" content="Zlecenio to nowoczesna platforma FSM do zarządzania zleceniami w terenie. Digitalizuj checklisty, zbieraj podpisy i generuj raporty AI." />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://zlecenio.app" />
                <meta property="og:title" content="Zlecenio - Zarządzaj serwisem bez papierów" />
                <meta property="og:description" content="Nowoczesna platforma dla firm serwisowych. Checklisty, zdjęcia, podpisy i raporty AI w jednej aplikacji." />
                <meta property="og:image" content="https://zlecenio.app/og-image.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://zlecenio.app" />
                <meta name="twitter:title" content="Zlecenio - Zarządzaj serwisem bez papierów" />
                <meta name="twitter:description" content="Nowoczesna platforma dla firm serwisowych. Checklisty, zdjęcia, podpisy i raporty AI w jednej aplikacji." />
                <meta name="twitter:image" content="https://zlecenio.app/og-image.png" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header/Navbar */}
                <header className="sticky top-0 z-50 border-b border-[#19140015] bg-[#FDFDFC]/80 backdrop-blur-md dark:border-[#3E3E3A]/50 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8 fill-current text-[#f53003] dark:text-[#FF4433]" />
                            <span className="text-xl font-bold tracking-tight">Zlecenio</span>
                        </div>
                        <nav className="flex items-center gap-4 lg:gap-8 text-sm font-medium">
                            <a href="#features" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="hidden hover:text-[#f53003] md:block dark:hover:text-[#FF4433]">Funkcje</a>

                            <a href="#how-it-works" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="hidden hover:text-[#f53003] md:block dark:hover:text-[#FF4433]">Jak to działa</a>

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
                                    Zlecenio to nowoczesna platforma FSM do zarządzania zleceniami w terenie.
                                    Digitalizuj checklisty, zbieraj podpisy i generuj raporty oparte na AI w kilka sekund.
                                </p>
                                <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
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

                                {isInstallable && (
                                    <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        <Button
                                            variant="outline"
                                            onClick={install}
                                            className="rounded-full border-[#19140015] bg-white/50 px-6 py-6 text-base font-medium backdrop-blur-sm transition-all hover:bg-white dark:border-[#3E3E3A] dark:bg-white/5 dark:hover:bg-white/10"
                                        >
                                            <Download className="mr-2 h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                                            Zainstaluj jako aplikację PWA
                                        </Button>
                                    </div>
                                )}
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

                    {/* Jak to działa - KROKI */}
                    <section id="how-it-works" className="py-24 bg-white dark:bg-[#0a0a0a] scroll-mt-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-base font-semibold text-[#f53003] dark:text-[#FF4433]">Prosty proces</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Jak działa Zlecenio?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                                {[
                                    {
                                        step: '01',
                                        title: 'Dodajesz zlecenie',
                                        desc: 'Wpisujesz dane klienta i przypisujesz technika w kilka sekund przez panel lub telefon.',
                                        icon: Briefcase
                                    },
                                    {
                                        step: '02',
                                        title: 'Praca w terenie',
                                        desc: 'Technik wypełnia cyfrową checklistę, robi zdjęcia i zbiera podpis klienta na ekranie.',
                                        icon: ClipboardCheck
                                    },
                                    {
                                        step: '03',
                                        title: 'Raport AI w sekundę',
                                        desc: 'System automatycznie generuje profesjonalny protokół i wysyła go do klienta.',
                                        icon: Sparkles
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="relative p-8 rounded-3xl border border-[#19140010] dark:border-[#3E3E3A] bg-[#FDFDFC] dark:bg-[#161615]">
                                        <div className="text-5xl font-black text-[#f53003]/10 dark:text-[#FF4433]/10 absolute top-4 right-8">
                                            {item.step}
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-[#f53003] flex items-center justify-center text-white mb-6">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Branże - 3 PRZYPADKI */}
                    <section id="use-cases" className="py-24 bg-[#F8F8F8] dark:bg-[#121212]/50 scroll-mt-24">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Komu pomoże nasza aplikacja?</h2>
                                    <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                        Skupiamy się na branżach, gdzie liczy się czas, dokumentacja fotograficzna i profesjonalizm przed klientem.
                                    </p>
                                    <div className="mt-10 space-y-8">
                                        {[
                                            {
                                                title: 'Serwis Klimatyzacji i HVAC',
                                                text: 'Zapomnij o papierowych protokołach. AI podsumuje stan filtrów i zasugeruje termin kolejnego przeglądu.',
                                                tags: ['Checklisty F-Gaz', 'Zdjęcia urządzeń']
                                            },
                                            {
                                                title: 'Firmy Sprzątające i Facility',
                                                text: 'Weryfikuj jakość pracy dzięki dokumentacji foto "przed i po" z dokładnym znacznikiem czasu i GPS.',
                                                tags: ['Dowód wykonania', 'Zespoły mobilne']
                                            },
                                            {
                                                title: 'Instalatorzy Fotowoltaiki i OZE',
                                                text: 'Błyskawicznie zamykaj protokoły odbioru z podpisem klienta, gotowe do wysłania do ubezpieczalni czy banku.',
                                                tags: ['Podpisy cyfrowe', 'Szybkie raporty']
                                            },
                                        ].map((item, idx) => (
                                            <div key={idx} className="group transition-all">
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f53003] text-white text-sm font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xl">{item.title}</p>
                                                        <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">{item.text}</p>
                                                        <div className="mt-3 flex gap-2">
                                                            {item.tags.map(tag => (
                                                                <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[#f53003] dark:text-[#FF4433]">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dekoracyjne karty z boku */}
                                <div className="relative">
                                    <div className="bg-gradient-to-tr from-[#f53003] to-[#ffb900] absolute -inset-4 blur-2xl opacity-10 rounded-[3rem]"></div>
                                    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-4 pt-8">
                                            <div className="p-6 rounded-2xl bg-white dark:bg-[#161615] shadow-xl border border-[#19140010] dark:border-[#3E3E3A]">
                                                <Users className="h-8 w-8 mb-4 text-[#f53003]" />
                                                <p className="font-bold">Dla Zespołów</p>
                                                <p className="text-xs text-[#706f6c]">Koordynuj wielu techników naraz.</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-[#1b1b18] text-white shadow-xl">
                                                <Zap className="h-8 w-8 mb-4 text-[#FFB800]" />
                                                <p className="font-bold">Automatyka</p>
                                                <p className="text-xs text-gray-400">AI oszczędza 4h pracy tygodniowo.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-6 rounded-2xl bg-white dark:bg-[#161615] shadow-xl border border-[#19140010] dark:border-[#3E3E3A]">
                                                <ShieldCheck className="h-8 w-8 mb-4 text-green-500" />
                                                <p className="font-bold text-sm">Legalność</p>
                                                <p className="text-xs text-[#706f6c]">Certyfikowane podpisy i logi.</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white dark:bg-[#161615] shadow-xl border border-[#19140010] dark:border-[#3E3E3A]">
                                                <Rocket className="h-8 w-8 mb-4 text-blue-500" />
                                                <p className="font-bold text-sm">Wdrożenie</p>
                                                <p className="text-xs text-[#706f6c]">Gotowy do pracy w 15 minut.</p>
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
                                Przetestuj Zlecenio całkowicie za darmo przez pierwsze 14 dni. <br className="hidden md:inline" />
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
                            <span className="text-sm font-bold tracking-tight">Zlecenio</span>
                        </div>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            © 2026 Zlecenio. System klasy FSM napędzany przez AI. Wszystkie prawa zastrzeżone.
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
