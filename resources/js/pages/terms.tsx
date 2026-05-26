import { Head, Link } from '@inertiajs/react';
import { Gavel, Scale, AlertCircle, ChevronLeft, ShieldCheck, CreditCard, Ban, Zap, PenTool } from 'lucide-react';

export default function Terms() {
    const lastUpdate = "26 maja 2026 r.";

    return (
        <>
            <Head>
                <title>Regulamin Serwisu - Zlecenio</title>
                <meta name="description" content="Regulamin świadczenia usług drogą elektroniczną przez platformę Zlecenio.pro." />
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
                                <Gavel className="w-10 h-10 text-[#f53003]" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Regulamin Serwisu</h1>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mt-2 font-medium">Zlecenio.pro – Platforma Zarządzania Serwisem (FSM)</p>
                            </div>
                        </div>
                        <div className="h-1 w-20 bg-[#f53003] rounded-full"></div>
                    </header>

                    <div className="space-y-12 text-[#1b1b18] dark:text-[#EDEDEC]">
                        <section className="scroll-mt-20" id="postanowienia-ogolne">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Scale className="w-6 h-6 text-[#f53003]" />
                                §1. Postanowienia ogólne
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>
                                    1. Niniejszy Regulamin określa zasady korzystania z platformy Zlecenio.pro (dalej: "Serwis"), dostępnej pod adresem internetowym https://zlecenio.pro.
                                </p>
                                <p>
                                    2. Serwis prowadzony jest przez Administratora i stanowi narzędzie klasy Field Service Management (FSM) oferowane w modelu Software as a Service (SaaS).
                                </p>
                                <p>
                                    3. Serwis jest przeznaczony wyłącznie dla podmiotów prowadzących działalność gospodarczą (B2B). Korzystanie z Serwisu przez konsumentów w rozumieniu Kodeksu Cywilnego jest niedozwolone.
                                </p>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-[#f53003]" />
                                §2. Rodzaj i zakres usług
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>1. Administrator świadczy drogą elektroniczną usługi polegające na:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Udostępnianiu panelu do zarządzania zleceniami, klientami i pracownikami.</li>
                                    <li>Automatyzacji procesów raportowania z wykorzystaniem sztucznej inteligencji (AI).</li>
                                    <li>Możliwości składania podpisów elektronicznych przez Klientów na ekranie urządzenia mobilnego (potwierdzenie wykonania prac).</li>
                                    <li>Przechowywaniu dokumentacji fotograficznej i geolokalizacyjnej z miejsca wykonywania zleceń.</li>
                                    <li>Automatycznym logowaniu zdarzeń systemowych i audytowych w celu zapewnienia rozliczalności i bezpieczeństwa danych.</li>
                                    <li>Generowaniu powiadomień SMS i e-mail.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-[#f53003]" />
                                §3. Wykorzystanie Sztucznej Inteligencji
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>
                                    1. Serwis wykorzystuje algorytmy sztucznej inteligencji do analizy danych i generowania raportów.
                                </p>
                                <p>
                                    2. Użytkownik przyjmuje do wiadomości, że treści generowane przez AI mogą zawierać błędy lub nieścisłości. Administrator nie ponosi odpowiedzialności za decyzje biznesowe podjęte w oparciu o automatycznie wygenerowane podsumowania.
                                </p>
                                <p>
                                    3. Użytkownik zobowiązuje się do weryfikacji każdego raportu przed jego ostatecznym zatwierdzeniem lub wysłaniem do klienta końcowego.
                                </p>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <PenTool className="w-6 h-6 text-[#f53003]" />
                                §4. Podpis Elektroniczny
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>
                                    1. Serwis umożliwia składanie podpisów elektronicznych na dokumentach cyfrowych (np. protokołach odbioru) za pośrednictwem ekranów dotykowych urządzeń mobilnych.
                                </p>
                                <p>
                                    2. Użytkownik oraz jego Klienci akceptują, że taki sposób składania oświadczeń woli jest wiążący w relacjach B2B i stanowi dokumentowe potwierdzenie wykonania usługi.
                                </p>
                                <p>
                                    3. Administrator dostarcza jedynie narzędzie techniczne i nie weryfikuje tożsamości osób podpisujących się w systemie. Pełną odpowiedzialność za autentyczność podpisu i uprawnienia osoby podpisującej ponosi Użytkownik.
                                </p>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-[#f53003]" />
                                §5. Płatności i Subskrypcje
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>
                                    1. Obecnie korzystanie ze wszystkich funkcji Serwisu jest całkowicie bezpłatne.
                                </p>
                                <p>
                                    2. Administrator zastrzega sobie prawo do wprowadzenia w przyszłości płatnych planów subskrypcyjnych. O wszelkich zmianach w modelu rozliczeń Użytkownicy zostaną poinformowani z wyprzedzeniem.
                                </p>
                                <p>
                                    3. W przypadku wprowadzenia płatności, rozliczenia będą realizowane w modelu subskrypcyjnym (miesięcznym lub rocznym) za pośrednictwem operatora płatności Stripe.
                                </p>
                            </div>
                        </section>

                        <section className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Ban className="w-6 h-6 text-[#f53003]" />
                                §6. Odpowiedzialność i Ograniczenia (Ochrona Administratora)
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[#706f6c] dark:text-[#A1A09A] leading-relaxed space-y-4">
                                <p>
                                    1. Administrator zapewnia dostępność Serwisu na poziomie 99% w skali roku, z wyłączeniem planowanych przerw konserwacyjnych.
                                </p>
                                <p>
                                    2. Administrator nie ponosi odpowiedzialności za:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Szkody powstałe w wyniku błędnego wprowadzenia danych przez Użytkownika lub jego pracowników.</li>
                                    <li>Treści przesyłane do Serwisu przez Użytkownika, w tym zdjęcia i załączniki (Użytkownik oświadcza, że posiada do nich pełne prawa).</li>
                                    <li>Treści generowane przez moduły AI oraz ich wykorzystanie w relacjach z Klientami Użytkownika.</li>
                                    <li>Prawidłowość i skuteczność prawną zebranych podpisów elektronicznych w konkretnych stanach faktycznych.</li>
                                    <li>Utratę zysków lub szkody pośrednie wynikające z ewentualnych przerw w działaniu Serwisu.</li>
                                </ul>
                                <p>
                                    3. Administrator zastrzega sobie prawo do natychmiastowego zablokowania dostępu do Serwisu w przypadku naruszenia przez Użytkownika postanowień Regulaminu lub przepisów prawa, bez prawa do odszkodowania po stronie Użytkownika.
                                </p>
                                <p>
                                    4. Odpowiedzialność odszkodowawcza Administratora względem Użytkownika z jakiegokolwiek tytułu jest ograniczona do kwoty zapłaconej przez Użytkownika za dostęp do Serwisu w miesiącu wystąpienia szkody, a w przypadku usług bezpłatnych – do kwoty 100 PLN.
                                </p>
                            </div>
                        </section>

                        <section className="p-8 bg-[#f53003]/5 rounded-3xl border border-[#f53003]/10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-[#f53003]" />
                                Reklamacje i Wsparcie
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                Wszelkie uwagi dotyczące działania systemu oraz reklamacje należy zgłaszać na adres e-mail: <span className="font-bold text-[#1b1b18] dark:text-[#EDEDEC]">pomoc@zlecenio.pro</span>. Czas rozpatrzenia reklamacji wynosi 14 dni roboczych.
                            </p>
                        </section>

                        <footer className="pt-12 border-t border-[#19140010] dark:border-[#3E3E3A]">
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Ostatnia aktualizacja Regulaminu: <span className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{lastUpdate}</span>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
