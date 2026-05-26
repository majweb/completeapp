import { Head, Link } from '@inertiajs/react';
import { Shield, Lock, Eye, FileText, ChevronLeft, Database, Share2, UserCheck, Mail, Cookie, PenTool } from 'lucide-react';

export default function Privacy() {
    const lastUpdate = "26 maja 2026 r.";

    return (
        <>
            <Head>
                <title>Polityka Prywatności - Zlecenio</title>
                <meta name="description" content="Zasady przetwarzania danych osobowych i ochrony prywatności w systemie Zlecenio.pro." />
            </Head>

            <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-[#706f6c] hover:text-[#f53003] mb-12 transition-colors group">
                        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        Powrót do strony głównej
                    </Link>

                    <header className="mb-16">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#f53003]/10 rounded-2xl">
                                <Shield className="w-10 h-10 text-[#f53003]" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Polityka Prywatności</h1>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mt-2 font-medium">Ochrona danych i RODO w Zlecenio.pro</p>
                            </div>
                        </div>
                        <div className="h-1 w-20 bg-[#f53003] rounded-full"></div>
                    </header>

                    <div className="space-y-12">
                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Lock className="w-6 h-6 text-[#f53003]" />
                                1. Administrator Danych
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                Administratorem danych osobowych Użytkowników oraz danych wprowadzanych do systemu w ramach świadczonych usług jest platforma Zlecenio.pro (dalej: "Administrator"). W sprawach związanych z ochroną danych można kontaktować się pod adresem: <span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">prywatnosc@zlecenio.pro</span>.
                            </p>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Database className="w-6 h-6 text-[#f53003]" />
                                2. Zakres zbieranych danych
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>Przetwarzamy dane niezbędne do realizacji usługi SaaS, w tym:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Dane identyfikacyjne:</span> imię, nazwisko, nazwa firmy, NIP.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Dane kontaktowe:</span> adres e-mail, numer telefonu.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Dane operacyjne i dowodowe:</span> adresy montażu, zdjęcia, współrzędne GPS oraz graficzny zapis podpisu elektronicznego.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Dane techniczne:</span> adres IP, typ przeglądarki, system operacyjny (zbierane automatycznie w logach systemowych i audytowych).</li>
                                </ul>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Share2 className="w-6 h-6 text-[#f53003]" />
                                3. Odbiorcy danych (Podpowierzenie)
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>W celu zapewnienia najwyższej jakości usług, dane mogą być przekazywane do zaufanych partnerów technologicznych:</p>
                                <ul className="list-disc pl-6 space-y-2 text-[#706f6c] dark:text-[#A1A09A]">
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">OpenAI:</span> w celu automatycznej analizy raportów i generowania podsumowań AI.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Stripe:</span> w celu bezpiecznej obsługi płatności i subskrypcji.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Twilio:</span> w celu wysyłki powiadomień SMS o statusach zleceń.</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Digital Ocean:</span> w celu bezpiecznego przechowywania danych i hostingu aplikacji na serwerach zlokalizowanych w UE.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Eye className="w-6 h-6 text-[#f53003]" />
                                4. Cele i podstawa przetwarzania
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>Dane przetwarzane są na podstawie:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Art. 6 ust. 1 lit. b RODO:</span> niezbędność do wykonania umowy (świadczenie usługi SaaS).</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Art. 6 ust. 1 lit. c RODO:</span> wypełnienie obowiązków prawnych (wystawianie faktur).</li>
                                    <li><span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Art. 6 ust. 1 lit. f RODO:</span> prawnie uzasadniony interes (zapewnienie bezpieczeństwa systemu, prowadzenie logów audytowych i ochrona przed roszczeniami).</li>
                                </ul>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <PenTool className="w-6 h-6 text-[#f53003]" />
                                5. Cele przetwarzania podpisów
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                Graficzny zapis podpisu zbierany jest wyłącznie w celu dokumentowania wykonania zlecenia oraz ochrony interesów prawnych Użytkownika i Administratora (cele dowodowe). Dane te nie są wykorzystywane do profilowania ani automatycznego podejmowania decyzji.
                            </p>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <UserCheck className="w-6 h-6 text-[#f53003]" />
                                6. Prawa Użytkownika
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Dostęp do danych", desc: "Masz prawo otrzymać kopię wszystkich swoich danych." },
                                    { title: "Sprostowanie", desc: "Możesz w każdej chwili poprawić nieaktualne informacje." },
                                    { title: "Usunięcie", desc: "Masz prawo żądać usunięcia konta i wszystkich powiązanych danych." },
                                    { title: "Przenoszenie", desc: "Możesz wyeksportować swoje dane w formacie nadającym się do odczytu maszynowego." }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-[#f53003]/5 rounded-2xl border border-[#f53003]/10">
                                        <h3 className="font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-1">{item.title}</h3>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-[#f53003]" />
                                7. Okres przechowywania
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                Dane są przechowywane przez okres aktywności konta Użytkownika. Po rozwiązaniu umowy, dane są archiwizowane przez okres 6 lat (wymogi podatkowe) lub do momentu wygaśnięcia roszczeń prawnych, a następnie trwale usuwane.
                            </p>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Cookie className="w-6 h-6 text-[#f53003]" />
                                8. Pliki Cookies
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                                Serwis wykorzystuje pliki cookies (tzw. ciasteczka) wyłącznie w celu utrzymania sesji Użytkownika po zalogowaniu. Nie wykorzystujemy plików cookies do celów reklamowych ani śledzenia aktywności Użytkownika poza Serwisem.
                            </p>
                        </section>

                        <footer className="pt-12 border-t border-[#19140010] dark:border-[#3E3E3A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Ostatnia aktualizacja Polityki: <span className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{lastUpdate}</span>
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#f53003]">
                                <Mail className="w-4 h-4" />
                                iod@zlecenio.pro
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
