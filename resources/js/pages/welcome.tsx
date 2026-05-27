import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Camera,
    ClipboardCheck,
    Download,
    Hammer,
    Flame,
    HardHat,
    LayoutDashboard,
    Lightbulb,
    Lock,
    Menu,
    Plug,
    Rocket,
    ShieldCheck,
    Signature,
    Sparkles,
    Thermometer,
    Truck,
    Users,
    Wrench,
    Zap
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { dashboard, login, privacy, register, terms } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const { isInstallable, install } = usePwaInstall();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <Head>
                <title>Zlecenio - Nowoczesne Zarządzanie Zleceniami Terenowymi</title>
                <meta name="description" content="Zlecenio to prosta aplikacja dla Twojej ekipy. Zapomnij o papierach – twórz zlecenia, wypełniaj protokoły i zbieraj podpisy na telefonie." />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://zlecenio.pro" />
                <meta property="og:title" content="Zlecenio - Zarządzaj serwisem bez papierów" />
                <meta property="og:description" content="Nowoczesna platforma dla firm serwisowych. Checklisty, zdjęcia, podpisy i raporty AI w jednej aplikacji." />
                <meta property="og:image" content="https://zlecenio.pro/og-image.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://zlecenio.pro" />
                <meta name="twitter:title" content="Zlecenio - Zarządzaj serwisem bez papierów" />
                <meta name="twitter:description" content="Nowoczesna platforma dla firm serwisowych. Checklisty, zdjęcia, podpisy i raporty AI w jednej aplikacji." />
                <meta name="twitter:image" content="https://zlecenio.pro/og-image.png" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header/Navbar */}
                <header className="sticky top-0 z-50 border-b border-[#19140015] bg-[#FDFDFC]/80 backdrop-blur-md dark:border-[#3E3E3A]/50 dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}>
                            <img src="/logo-full-croped.png" alt="Zlecenio" className="h-8 w-auto" />
                        </div>
                        <div className="flex items-center gap-4 lg:gap-8 text-sm font-medium">
                            <nav className="hidden items-center gap-4 lg:gap-8 md:flex">
                                <a href="#features" onClick={(e) => {
                                    e.preventDefault();

                                    if (typeof window !== 'undefined') {
                                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }} className="hover:text-[#f53003] dark:hover:text-[#FF4433] cursor-pointer">Funkcje</a>

                                <a href="#how-it-works" onClick={(e) => {
                                    e.preventDefault();

                                    if (typeof window !== 'undefined') {
                                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }} className="hover:text-[#f53003] dark:hover:text-[#FF4433] cursor-pointer">Jak to działa</a>

                                <a href="#industries" onClick={(e) => {
                                    e.preventDefault();

                                    if (typeof window !== 'undefined') {
                                        document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }} className="hover:text-[#f53003] dark:hover:text-[#FF4433] cursor-pointer">Branże</a>
                            </nav>

                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1b1b18] px-5 py-2 text-white hover:bg-[#1b1b18]/90 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white transition-all shadow-sm"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Panel główny</span>
                                </Link>
                            ) : (
                                <div className="hidden md:flex items-center gap-2 sm:gap-3">
                                    <Link
                                        href={login()}
                                        className="rounded-full border border-[#19140015] px-4 py-2 hover:bg-black/5 dark:border-[#3E3E3A] dark:hover:bg-white/5 text-xs sm:text-sm"
                                    >
                                        Zaloguj
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-[#f53003] px-4 py-2 text-white hover:bg-[#f53003]/90 dark:bg-[#FF4433] dark:hover:bg-[#FF4433]/90 transition-all shadow-sm text-xs sm:text-sm"
                                    >
                                        Darmowe testy
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu */}
                            <div className="md:hidden">
                                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-full sm:w-full border-l-0 dark:bg-[#0a0a0a]">
                                        <SheetHeader className="text-left border-b border-[#19140015] dark:border-[#3E3E3A]/50 pb-4 mb-4">
                                            <SheetTitle className="flex items-center gap-2">
                                                <img src="/logo-full-croped.png" alt="Zlecenio" className="h-6 w-auto" />
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="flex flex-col gap-6 mt-6">
                                            <a href="#features" onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                                setIsMenuOpen(false);
                                            }} className="text-xl font-semibold hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors cursor-pointer px-2">Funkcje</a>

                                            <a href="#how-it-works" onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                                setIsMenuOpen(false);
                                            }} className="text-xl font-semibold hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors cursor-pointer px-2">Jak to działa</a>

                                            <a href="#industries" onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' });
                                                setIsMenuOpen(false);
                                            }} className="text-xl font-semibold hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors cursor-pointer px-2">Branże</a>

                                            <hr className="border-[#19140015] dark:border-[#3E3E3A]/50 mx-2" />

                                            {!auth.user && (
                                                <div className="flex flex-col gap-4 p-2">
                                                    <Link
                                                        href={login()}
                                                        className="w-full text-center rounded-xl border border-[#19140015] py-4 text-lg font-medium hover:bg-black/5 dark:border-[#3E3E3A] dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        Zaloguj się
                                                    </Link>
                                                    <Link
                                                        href={register()}
                                                        className="w-full text-center rounded-xl bg-[#f53003] py-4 text-white text-lg font-semibold hover:bg-[#f53003]/90 dark:bg-[#FF4433] dark:hover:bg-[#FF4433]/90 transition-all shadow-md"
                                                    >
                                                        Rozpocznij darmowy test
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
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
                                    Zlecenio to prosta aplikacja dla Twojej ekipy. Zapomnij o papierowych protokołach – planuj pracę, wypełniaj checklisty i zbieraj podpisy na telefonie. Idealna dla serwisu, montażu, budowlanki i każdej firmy pracującej w terenie.
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
                                            description: 'Szyfrowanie danych i zaawansowane uprawnienia (Właściciel, Manager, Technik).',
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

                    {/* Sekcja Branż i Zawodów - Nowa siatka */}
                    <section id="industries" className="py-24 bg-white dark:bg-[#0a0a0a] scroll-mt-24 border-t border-[#19140005] dark:border-[#3E3E3A]/20">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center mb-16">
                                <h2 className="text-base font-semibold leading-7 text-[#f53003] dark:text-[#FF4433]">Dla kogo jest Zlecenio?</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Jedna aplikacja, setki zastosowań</p>
                                <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                    Obsługujemy profesjonalistów z wielu branż, pomagając im w codziennej organizacji pracy.
                                </p>
                            </div>
                            <div className="mx-auto grid max-w-none grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                {[
                                    { name: 'Elektrycy', icon: Zap },
                                    { name: 'Hydraulicy', icon: Wrench },
                                    { name: 'Serwis HVAC', icon: Thermometer },
                                    { name: 'Budownictwo', icon: HardHat },
                                    { name: 'Stolarze', icon: Hammer },
                                    { name: 'Oświetlenie', icon: Lightbulb },
                                    { name: 'Instalatorzy OZE', icon: Plug },
                                    { name: 'Transport', icon: Truck },
                                    { name: 'Serwis AGD', icon: Briefcase },
                                    { name: 'Zespoły Sprzątające', icon: Sparkles },
                                    { name: 'Ochrona i Alarmy', icon: ShieldCheck },
                                    { name: 'Architekci Krajobrazu', icon: Camera },
                                    { name: 'Gazownicy', icon: Flame },
                                    { name: 'Kominiarze', icon: Lock },
                                    { name: 'Montaż mebli', icon: Hammer },
                                    { name: 'Dekarze', icon: HardHat },
                                    { name: 'Ogrody', icon: Camera },
                                    { name: 'Serwis Bram', icon: Zap },
                                ].map((industry) => (
                                    <div key={industry.name} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F8F8F8] dark:bg-[#161615] ring-1 ring-[#19140010] dark:ring-[#3E3E3A] hover:shadow-md transition-all group">
                                        <div className="mb-4 p-3 rounded-full bg-white dark:bg-[#0a0a0a] ring-1 ring-[#19140005] dark:ring-[#3E3E3A] group-hover:scale-110 transition-transform">
                                            <industry.icon className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                        </div>
                                        <span className="text-sm font-bold text-center">{industry.name}</span>
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
                            <img src="/logo-full-croped.png" alt="Zlecenio" className="h-5 w-auto" />
                        </div>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            © 2026 Zlecenio. System klasy FSM napędzany przez AI. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="flex gap-6">
                            <Link href={terms().url} className="text-xs hover:text-[#f53003] transition-colors dark:hover:text-[#FF4433]">Regulamin</Link>
                            <Link href={privacy().url} className="text-xs hover:text-[#f53003] transition-colors dark:hover:text-[#FF4433]">Prywatność</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
