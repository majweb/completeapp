import { Head, usePage } from '@inertiajs/react';
import { Briefcase, Camera, CheckCircle2, ClipboardCheck, Download, HardHat, Info, PenTool, Settings, ShieldCheck, Users as UsersIcon, XCircle } from 'lucide-react';

import { downloadPdf } from '@/actions/App/Http/Controllers/GuideController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const permissions = [
    { feature: 'Dashboard / Statystyki', owner: true, manager: true, technician: 'Tylko własne' },
    { feature: 'Zlecenia (Widok)', owner: 'Wszystkie', manager: 'Wszystkie', technician: 'Tylko przypisane' },
    { feature: 'Zlecenia (Tworzenie/Edycja)', owner: true, manager: true, technician: 'Tylko własne' },
    { feature: 'Zlecenia (Usuwanie)', owner: true, manager: true, technician: 'Tylko przypisane' },
    { feature: 'Zlecenia (Zatwierdzanie)', owner: true, manager: true, technician: false },
    { feature: 'Baza Klientów', owner: true, manager: true, technician: 'Widok' },
    { feature: 'Szablony Prac', owner: true, manager: true, technician: false },
    { feature: 'Zarządzanie Ekipą', owner: true, manager: true, technician: false },
    { feature: 'Ustawienia Firmy', owner: true, manager: false, technician: false },
    { feature: 'Subskrypcje i Płatności', owner: true, manager: false, technician: false },
    { feature: 'Raporty PDF / Wysyłka', owner: true, manager: true, technician: true },
];

export default function RolesGuide() {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const userRole = auth.user?.role;

    return (
        <>
            <Head title="Przewodnik po rolach i instrukcje" />
            <div className="py-8 px-4 w-full">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Przewodnik po rolach i instrukcje</h1>
                        <p className="text-muted-foreground mt-2 text-sm md:text-base">
                            Dowiedz się, jakie możliwości oferuje Twoje konto i jak korzystać z systemu.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <a href={downloadPdf.url()} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                            Pobierz instrukcję PDF
                        </a>
                    </Button>
                </div>

                <Tabs defaultValue={userRole || 'owner'} className="mb-10">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="owner" className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Właściciel</span>
                        </TabsTrigger>
                        <TabsTrigger value="manager" className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> <span className="hidden sm:inline">Manager</span>
                        </TabsTrigger>
                        <TabsTrigger value="technician" className="flex items-center gap-2">
                            <HardHat className="w-4 h-4" /> <span className="hidden sm:inline">Technik</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="owner" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <ShieldCheck className="w-5 h-5" /> Instrukcja dla Właściciela
                                </CardTitle>
                                <CardDescription>Pełna kontrola nad organizacją i finansami.</CardDescription>
                                <div className="mt-2 text-sm text-muted-foreground">Nowość: możesz zatwierdzać zlecenia zakończone przez techników. Po zatwierdzeniu status zmienia się na „Zatwierdzone”.</div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><PenTool className="w-4 h-4" /> Tworzenie Zleceń</h4>
                                        <p className="text-sm text-muted-foreground">Jako Właściciel możesz samodzielnie dodawać nowe zlecenia, przypisywać je do techników i zarządzać ich przebiegiem.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4" /> Konfiguracja Firmy</h4>
                                        <p className="text-sm text-muted-foreground">W sekcji "Ustawienia Firmy" zdefiniuj dane adresowe, NIP oraz wgraj logo, które będzie widoczne na raportach dla klientów.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><UsersIcon className="w-4 h-4" /> Zarządzanie Zespołem</h4>
                                        <p className="text-sm text-muted-foreground">Dodawaj pracowników w sekcji "Technicy". Pamiętaj, że możesz im przypisać rolę Technika lub Managera.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Monitoring i Limity</h4>
                                        <p className="text-sm text-muted-foreground">Śledź wykorzystanie limitów zleceń w swoim planie w sekcji "Subskrypcja".</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Pełny wgląd</h4>
                                        <p className="text-sm text-muted-foreground">Jako właściciel widzisz wszystkie zlecenia i masz dostęp do wszystkich funkcji systemu bez ograniczeń.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manager" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-600">
                                    <Briefcase className="w-5 h-5" /> Instrukcja dla Managera
                                </CardTitle>
                                <CardDescription>Koordynacja zleceń i zarządzanie bazą klientów.</CardDescription>
                                <div className="mt-2 text-sm text-muted-foreground">Nowość: możesz zatwierdzać zlecenia zakończone przez techników. Po zatwierdzeniu status zmienia się na „Zatwierdzone”.</div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><PenTool className="w-4 h-4" /> Planowanie Prac</h4>
                                        <p className="text-sm text-muted-foreground">Twórz nowe zlecenia, przypisując je do techników. Wybieraj odpowiednie szablony checklist dla danego typu pracy.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Szablony</h4>
                                        <p className="text-sm text-muted-foreground">Definiuj standardy pracy poprzez tworzenie szablonów prac. To one determinują, co technik musi sprawdzić na miejscu.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><UsersIcon className="w-4 h-4" /> Relacje z Klientami</h4>
                                        <p className="text-sm text-muted-foreground">Zarządzaj bazą klientów. Możesz korzystać z funkcji importu z pliku CSV, aby szybko dodać wielu kontrahentów.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Download className="w-4 h-4" /> Raportowanie</h4>
                                        <p className="text-sm text-muted-foreground">Weryfikuj zakończone zlecenia. Pobieraj raporty PDF i wysyłaj je bezpośrednio do klientów z poziomu systemu.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="technician" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-600">
                                    <HardHat className="w-5 h-5" /> Instrukcja dla Technika
                                </CardTitle>
                                <CardDescription>Praca w terenie i dokumentacja mobilna.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Twoje Zlecenia</h4>
                                        <p className="text-sm text-muted-foreground">Na Dashboardzie i liście zleceń widzisz tylko prace przypisane do Ciebie. Zmieniaj statusy, aby zespół wiedział, na jakim etapie jesteś.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> Dokumentacja Foto</h4>
                                        <p className="text-sm text-muted-foreground">Rób zdjęcia przed rozpoczęciem i po zakończeniu pracy. Zdjęcia są automatycznie dołączane do raportu końcowego.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Wypełnianie Checklisty</h4>
                                        <p className="text-sm text-muted-foreground">Odznaczaj wykonane kroki w systemie. System nie pozwoli zakończyć zlecenia bez wypełnienia wymaganych pól.</p>
                                    </div>
                                    <div className="space-y-2 border p-4 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><PenTool className="w-4 h-4" /> Podpis Klienta</h4>
                                        <p className="text-sm text-muted-foreground">Po skończonej pracy poproś klienta o podpis bezpośrednio na Twoim telefonie/tablecie w aplikacji.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Szczegółowa tabela uprawnień</CardTitle>
                        <CardDescription>Zestawienie funkcji dostępnych dla poszczególnych ról.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Funkcjonalność</TableHead>
                                        <TableHead className="text-center">Właściciel</TableHead>
                                        <TableHead className="text-center">Manager</TableHead>
                                        <TableHead className="text-center">Technik</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((p) => (
                                        <TableRow key={p.feature}>
                                            <TableCell className="font-medium">{p.feature}</TableCell>
                                            <TableCell className="text-center">
                                                {typeof p.owner === 'boolean' ? (
                                                    p.owner ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-300 mx-auto" />
                                                ) : <span className="text-xs md:text-sm font-semibold">{p.owner}</span>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {typeof p.manager === 'boolean' ? (
                                                    p.manager ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-300 mx-auto" />
                                                ) : <span className="text-xs md:text-sm font-semibold">{p.manager}</span>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {typeof p.technician === 'boolean' ? (
                                                    p.technician ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-300 mx-auto" />
                                                ) : <span className="text-xs md:text-sm font-semibold">{p.technician}</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 bg-muted/50 p-6 rounded-lg border border-dashed">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-5 h-5" /> Warto wiedzieć
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                        <li>System automatycznie izoluje dane między różnymi firmami.</li>
                        <li>Manager może zarządzać ekipą, ale nie ma dostępu do danych finansowych firmy.</li>
                        <li>Technik widzi tylko zlecenia, które są mu bezpośrednio przypisane.</li>
                        <li>Tylko Właściciel może zmieniać plan subskrypcji i zarządzać płatnościami.</li>
                        <li>Zatwierdzanie jest dostępne tylko dla ról Właściciel i Manager i możliwe wyłącznie dla zleceń o statusie „Zakończone”.</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
