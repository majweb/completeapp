import { Head, Link, useForm } from '@inertiajs/react';
import { LucideAlertCircle, LucideArrowLeft, LucidePlus, LucideSave } from 'lucide-react';

import { store } from '@/actions/App/Http/Controllers/JobController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { create as createClient } from '@/routes/clients';
import { create as createTemplate } from '@/routes/job-templates';
import { index } from '@/routes/jobs';

interface Client {
    id: number;
    name: string;
}

interface Template {
    id: number;
    name: string;
}

interface Technician {
    id: number;
    name: string;
}

interface Props {
    clients: Client[];
    templates: Template[];
    technicians: Technician[];
}

export default function Create({ clients, templates, technicians }: Props) {
    const getLocalDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        return now.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        template_id: '',
        assigned_to: '',
        scheduled_at: getLocalDateTime(),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const hasNoClients = clients.length === 0;
    const hasNoTemplates = templates.length === 0;

    return (
        <>
            <Head title="Nowe Zlecenie" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={index()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Utwórz nowe zlecenie</h1>
                </div>

                <div className="w-full space-y-4">
                    {hasNoClients && (
                        <Alert variant="warning" className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                            <LucideAlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                            <AlertTitle className="text-yellow-800 dark:text-yellow-400">Wymagani Klienci</AlertTitle>
                            <AlertDescription className="flex items-center justify-between text-yellow-700 dark:text-yellow-300/80">
                                <span>Nie możesz utworzyć zlecenia bez przypisanego klienta. Dodaj klienta do bazy, aby kontynuować.</span>
                                <Button size="sm" variant="outline" asChild className="ml-4 border-yellow-300 bg-white hover:bg-yellow-100 hover:text-yellow-900 dark:border-yellow-800 dark:bg-slate-950 dark:hover:bg-yellow-900/30">
                                    <Link href={createClient()}>
                                        <LucidePlus className="mr-2 h-4 w-4" />
                                        Dodaj pierwszego klienta
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {hasNoTemplates && (
                        <Alert variant="warning" className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                            <LucideAlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                            <AlertTitle className="text-yellow-800 dark:text-yellow-400">Brak Szablonów Prac</AlertTitle>
                            <AlertDescription className="flex items-center justify-between text-yellow-700 dark:text-yellow-300/80">
                                <span>Szablony definiują listę zadań do wykonania. Stwórz szablon, aby móc go przypisać do zlecenia.</span>
                                <Button size="sm" variant="outline" asChild className="ml-4 border-yellow-300 bg-white hover:bg-yellow-100 hover:text-yellow-900 dark:border-yellow-800 dark:bg-slate-950 dark:hover:bg-yellow-900/30">
                                    <Link href={createTemplate()}>
                                        <LucidePlus className="mr-2 h-4 w-4" />
                                        Utwórz swój pierwszy szablon
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Szczegóły zlecenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_id">Klient</Label>
                                        <Select
                                            onValueChange={(value) => setData('client_id', value)}
                                            disabled={hasNoClients}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={hasNoClients ? "Najpierw dodaj klienta" : "Wybierz klienta"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.client_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="template_id">Szablon pracy</Label>
                                        <Select
                                            onValueChange={(value) => setData('template_id', value)}
                                            disabled={hasNoTemplates}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={hasNoTemplates ? "Najpierw utwórz szablon" : "Wybierz szablon"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id.toString()}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.template_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_to">Technik (osoba przypisana)</Label>
                                        <Select onValueChange={(value) => setData('assigned_to', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Wybierz technika" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technicians.map((tech) => (
                                                    <SelectItem key={tech.id} value={tech.id.toString()}>
                                                        {tech.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.assigned_to} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_at">Data i godzina wykonania</Label>
                                        <input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.scheduled_at}
                                            onChange={(e) => setData('scheduled_at', e.target.value)}
                                            min={getLocalDateTime()}
                                            required
                                        />
                                        <InputError message={errors.scheduled_at} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" type="button" asChild disabled={processing} className="cursor-pointer">
                                        <Link href={index()}>Anuluj</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || hasNoClients || hasNoTemplates}
                                        className="cursor-pointer"
                                    >
                                        <LucideSave className="mr-2 h-4 w-4" />
                                        Utwórz zlecenie
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: index() },
        { title: 'Nowe', href: '#' },
    ],
};
