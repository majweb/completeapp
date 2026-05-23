import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucideSave, LucideInfo, LucideMail, LucidePhone, LucideMapPin, LucideUser } from 'lucide-react';
import { useMemo } from 'react';

import { update } from '@/actions/App/Http/Controllers/JobController';
import InputError from '@/components/input-error';
import JobMap from '@/components/job-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index } from '@/routes/jobs';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
}

interface Template {
    id: number;
    name: string;
}

interface Technician {
    id: number;
    name: string;
}

interface Job {
    id: number;
    client_id: number;
    template_id: number;
    assigned_to: number;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
}

interface Props {
    job: Job;
    clients: Client[];
    templates: Template[];
    technicians: Technician[];
}

export default function Edit({ job, clients, templates, technicians }: Props) {
    const formatDateTimeForInput = (dateString: string | null) => {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

        return date.toISOString().slice(0, 16);
    };

    const { data, setData, put, processing, errors } = useForm({
        client_id: job.client_id.toString(),
        template_id: job.template_id.toString(),
        assigned_to: job.assigned_to.toString(),
        scheduled_at: formatDateTimeForInput(job.scheduled_at),
        started_at: formatDateTimeForInput(job.started_at),
        completed_at: formatDateTimeForInput(job.completed_at),
    });

    const selectedClient = useMemo(() => {
        return clients.find((c) => c.id.toString() === data.client_id) || null;
    }, [data.client_id, clients]);

    const clientMapData = useMemo(() => {
        if (!selectedClient || selectedClient.latitude === null || selectedClient.longitude === null) {
            return [];
        }

        return [{
            id: selectedClient.id,
            status: 'new',
            status_label: 'Lokalizacja klienta',
            client_name: selectedClient.name,
            address: selectedClient.address || '',
            latitude: selectedClient.latitude,
            longitude: selectedClient.longitude
        }];
    }, [selectedClient]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ job: job.id }));
    };

    return (
        <>
            <Head title={`Edytuj Zlecenie #${job.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={index()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Edytuj zlecenie #{job.id}</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
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
                                                defaultValue={data.client_id}
                                                onValueChange={(value) => setData('client_id', value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Wybierz klienta" />
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
                                                defaultValue={data.template_id}
                                                onValueChange={(value) => setData('template_id', value)}
                                                disabled
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Wybierz szablon" />
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
                                            <p className="text-xs text-muted-foreground">Szablonu nie można zmienić po utworzeniu zlecenia.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="assigned_to">Technik (osoba przypisana)</Label>
                                            <Select
                                                defaultValue={data.assigned_to}
                                                onValueChange={(value) => setData('assigned_to', value)}
                                            >
                                                <SelectTrigger className="w-full">
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
                                            <Label htmlFor="scheduled_at">Zaplanowana data i godzina</Label>
                                            <input
                                                id="scheduled_at"
                                                type="datetime-local"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                value={data.scheduled_at}
                                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                required
                                            />
                                            <InputError message={errors.scheduled_at} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="started_at">Data rozpoczęcia</Label>
                                            <input
                                                id="started_at"
                                                type="datetime-local"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                value={data.started_at}
                                                onChange={(e) => setData('started_at', e.target.value)}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                            />
                                            <InputError message={errors.started_at} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="completed_at">Data zakończenia</Label>
                                            <input
                                                id="completed_at"
                                                type="datetime-local"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                value={data.completed_at}
                                                onChange={(e) => setData('completed_at', e.target.value)}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                min={data.started_at}
                                            />
                                            <InputError message={errors.completed_at} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" type="button" asChild disabled={processing} className="cursor-pointer">
                                            <Link href={index()}>Anuluj</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing} className="cursor-pointer">
                                            <LucideSave className="mr-2 h-4 w-4" />
                                            Zapisz zmiany
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        {selectedClient ? (
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <LucideInfo className="h-5 w-5 text-primary" />
                                        <CardTitle>Informacje o kliencie</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-lg">{selectedClient.name}</p>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedClient.address && (
                                                <div className="flex items-start gap-2">
                                                    <LucideMapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                    <span>{selectedClient.address}</span>
                                                </div>
                                            )}
                                            {selectedClient.email && (
                                                <div className="flex items-center gap-2">
                                                    <LucideMail className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <a href={`mailto:${selectedClient.email}`} className="text-primary hover:underline">{selectedClient.email}</a>
                                                </div>
                                            )}
                                            {selectedClient.phone && (
                                                <div className="flex items-center gap-2">
                                                    <LucidePhone className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <a href={`tel:${selectedClient.phone}`} className="text-primary hover:underline">{selectedClient.phone}</a>
                                                </div>
                                            )}
                                        </div>

                                        {selectedClient.notes && (
                                            <div className="mt-4 p-3 bg-muted rounded-md italic">
                                                "{selectedClient.notes}"
                                            </div>
                                        )}
                                    </div>

                                    {selectedClient.latitude && selectedClient.longitude && (
                                        <div className="space-y-2">
                                            <Label>Lokalizacja</Label>
                                            <JobMap
                                                jobs={clientMapData}
                                                height="250px"
                                                center={[selectedClient.latitude, selectedClient.longitude]}
                                                zoom={15}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-full flex items-center justify-center border-dashed p-12 text-center">
                                <CardContent className="p-0">
                                    <LucideUser className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">Wybierz klienta, aby zobaczyć jego dane i lokalizację.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: index() },
        { title: 'Edycja', href: '#' },
    ],
};
