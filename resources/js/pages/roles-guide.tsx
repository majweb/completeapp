import { Head, usePage } from '@inertiajs/react';
import { ShieldCheck, HardHat, Briefcase, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

const roles = [
    {
        id: 'owner',
        name: 'Właściciel (Owner)',
        description: 'Pełna kontrola nad firmą, subskrypcjami i ustawieniami.',
        icon: ShieldCheck,
        color: 'text-red-600 bg-red-50',
    },
    {
        id: 'manager',
        name: 'Manager',
        description: 'Zarządzanie operacyjne zleceniami, klientami i zespołem.',
        icon: Briefcase,
        color: 'text-blue-600 bg-blue-50',
    },
    {
        id: 'technician',
        name: 'Technik (Mobile User)',
        description: 'Realizacja zleceń w terenie, wypełnianie checklist i dokumentacja foto.',
        icon: HardHat,
        color: 'text-orange-600 bg-orange-50',
    },
];

const permissions = [
    { feature: 'Dashboard / Statystyki', owner: true, manager: true, technician: 'Tylko własne' },
    { feature: 'Zlecenia (Widok)', owner: 'Wszystkie', manager: 'Wszystkie', technician: 'Tylko przypisane' },
    { feature: 'Zlecenia (Tworzenie/Edycja)', owner: true, manager: true, technician: 'Tylko własne' },
    { feature: 'Zlecenia (Usuwanie)', owner: true, manager: true, technician: 'Tylko przypisane' },
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
            <Head title="Przewodnik po rolach" />
            <div className="py-8 px-4 w-full">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Przewodnik po rolach użytkowników</h1>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base">
                        Dowiedz się, jakie możliwości oferuje Twoje konto i jakie uprawnienia posiadają poszczególni członkowie zespołu.
                    </p>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-10">
                    {roles.map((role) => (
                        <Card
                            key={role.name}
                            className={`relative overflow-hidden transition-all duration-300 ${
                                userRole === role.id
                                    ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md'
                                    : 'hover:border-primary/50'
                            }`}
                        >
                            {userRole === role.id && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Badge variant="default" className="flex items-center gap-1 font-medium bg-primary text-primary-foreground">
                                        <BadgeCheck className="w-3 h-3" />
                                        Twoja rola
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="space-y-1">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${role.color}`}>
                                    <role.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl">{role.name}</CardTitle>
                                <CardDescription>{role.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

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
                    </ul>
                </div>
            </div>
        </>
    );
}
