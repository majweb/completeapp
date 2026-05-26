import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LucideArrowLeft, LucideSave, LucideInfo, LucideMail, LucidePhone, LucideMapPin, LucideUser, LucideNavigation, LucideAlertTriangle, LucideCheckCircle2, LucideCircle, LucideMessageSquare } from 'lucide-react';
import { useMemo, Suspense, lazy } from 'react';

import { update } from '@/actions/App/Http/Controllers/JobController';
import InputError from '@/components/input-error';
const JobMap = lazy(() => import('@/components/job-map'));
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '@/components/voice-input';
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
    uuid: string;
    client_id: number;
    template_id: number;
    assigned_to: number;
    status: string;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
    report_summary: string | null;
    media: any[];
    template?: {
        name: string;
        require_photo_before: boolean;
        require_photo_after: boolean;
        require_signature: boolean;
    };
}

interface Props {
    job: Job;
    clients: Client[];
    templates: Template[];
    technicians: Technician[];
}

export default function Edit({ job, clients, templates, technicians }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isTechnician = user.role === 'technician';
    const isCompleted = job.status === 'completed' || job.status === 'approved';
    const canEdit = !isCompleted || !isTechnician;

    const getLocalDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        return now.toISOString().slice(0, 16);
    };

    const formatDateTimeForInput = (dateString: string | null) => {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

        return date.toISOString().slice(0, 16);
    };

    const { data, setData, put, processing, errors } = useForm({
        client_id: job.client_id?.toString() || '',
        template_id: job.template_id?.toString() || '',
        assigned_to: job.assigned_to?.toString() || '',
        scheduled_at: formatDateTimeForInput(job.scheduled_at),
        started_at: formatDateTimeForInput(job.started_at),
        completed_at: formatDateTimeForInput(job.completed_at),
        report_summary: job.report_summary || '',
    });

    const selectedClient = useMemo(() => {
        if (!data.client_id) {
            return null;
        }

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Nowe</Badge>;
            case 'in_progress': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">W toku</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Zakończone</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const requirements = useMemo(() => {
        if (!job.template) {
            return [];
        }

        const reqs = [];

        if (job.template.require_photo_before) {
            const hasBefore = job.media?.some(m => m.collection_name === 'images_before');
            reqs.push({ label: 'Zdjęcie PRZED', met: hasBefore });
        }

        if (job.template.require_photo_after) {
            const hasAfter = job.media?.some(m => m.collection_name === 'images_after');
            reqs.push({ label: 'Zdjęcie PO', met: hasAfter });
        }

        if (job.template.require_signature) {
            const hasSig = job.media?.some(m => m.collection_name === 'signature');
            reqs.push({ label: 'Podpis klienta', met: hasSig });
        }

        return reqs;
    }, [job]);

    return (
        <>
            <Head title={`Edytuj Zlecenie #${job.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="cursor-pointer shrink-0">
                            <Link href={index()}>
                                <LucideArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Edytuj zlecenie #{job.id}</h1>
                        <div className="hidden sm:block">
                            {getStatusBadge(job.status)}
                        </div>
                    </div>
                    <div className="sm:hidden flex justify-start">
                        {getStatusBadge(job.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Szczegóły zlecenia</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-6">
                                        {/* Sekcja: Podstawowe informacje */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Podstawowe informacje</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="client_id">Klient</Label>
                                                <Select
                                                    defaultValue={data.client_id}
                                                    onValueChange={(value) => setData('client_id', value)}
                                                    disabled={!canEdit}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Wybierz klienta" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="p-2 sticky top-0 bg-popover z-10">
                                                            <input
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                placeholder="Szukaj klienta..."
                                                                onChange={(e) => {
                                                                    const search = e.target.value.toLowerCase();
                                                                    const items = document.querySelectorAll('[data-client-name]');
                                                                    items.forEach((item) => {
                                                                        const name = item.getAttribute('data-client-name')?.toLowerCase() || '';
                                                                        (item as HTMLElement).style.display = name.includes(search) ? 'flex' : 'none';
                                                                    });
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {clients.map((client) => (
                                                            <SelectItem
                                                                key={client.id}
                                                                value={client.id.toString()}
                                                                data-client-name={client.name}
                                                            >
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
                                        </div>

                                        {/* Sekcja: Przypisanie i czas */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Przypisanie i czas</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="assigned_to">Technik (osoba przypisana)</Label>
                                                <Select
                                                    defaultValue={data.assigned_to}
                                                    onValueChange={(value) => setData('assigned_to', value)}
                                                    disabled={!canEdit}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Wybierz technika" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="p-2 sticky top-0 bg-popover z-10">
                                                            <input
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                placeholder="Szukaj technika..."
                                                                onChange={(e) => {
                                                                    const search = e.target.value.toLowerCase();
                                                                    const items = document.querySelectorAll('[data-technician-name]');
                                                                    items.forEach((item) => {
                                                                        const name = item.getAttribute('data-technician-name')?.toLowerCase() || '';
                                                                        (item as HTMLElement).style.display = name.includes(search) ? 'flex' : 'none';
                                                                    });
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {technicians.map((tech) => (
                                                            <SelectItem
                                                                key={tech.id}
                                                                value={tech.id.toString()}
                                                                data-technician-name={tech.name}
                                                            >
                                                                {tech.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.assigned_to} />
                                            </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="scheduled_at">Zaplanowana data i godzina</Label>
                                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                                        <div className="relative flex-1">
                                                            <input
                                                                id="scheduled_at"
                                                                type="datetime-local"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                                value={data.scheduled_at}
                                                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                                                onClick={(e) => e.currentTarget.showPicker()}
                                                                required
                                                                disabled={!canEdit}
                                                            />
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 sm:h-9 px-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                                onClick={() => setData('scheduled_at', getLocalDateTime())}
                                                                disabled={!canEdit}
                                                            >
                                                                Dziś
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 sm:h-9 px-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                                onClick={() => {
                                                                    const tomorrow = new Date();
                                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                                    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
                                                                    setData('scheduled_at', tomorrow.toISOString().slice(0, 16));
                                                                }}
                                                                disabled={!canEdit}
                                                            >
                                                                Jutro
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 sm:h-9 px-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                                onClick={() => {
                                                                    const weekLater = new Date();
                                                                    weekLater.setDate(weekLater.getDate() + 7);
                                                                    weekLater.setMinutes(weekLater.getMinutes() - weekLater.getTimezoneOffset());
                                                                    setData('scheduled_at', weekLater.toISOString().slice(0, 16));
                                                                }}
                                                                disabled={!canEdit}
                                                            >
                                                                Tydzień
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 sm:h-9 px-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                                onClick={() => {
                                                                    const monthLater = new Date();
                                                                    monthLater.setMonth(monthLater.getMonth() + 1);
                                                                    monthLater.setMinutes(monthLater.getMinutes() - monthLater.getTimezoneOffset());
                                                                    setData('scheduled_at', monthLater.toISOString().slice(0, 16));
                                                                }}
                                                                disabled={!canEdit}
                                                            >
                                                                Miesiąc
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <InputError message={errors.scheduled_at} />
                                                </div>
                                        </div>

                                        {/* Sekcja: Postęp prac */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Postęp prac</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="started_at">Data rozpoczęcia</Label>
                                                <div className="flex gap-2">
                                                    <input
                                                        id="started_at"
                                                        type="datetime-local"
                                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                        value={data.started_at}
                                                        onChange={(e) => setData('started_at', e.target.value)}
                                                        onClick={(e) => e.currentTarget.showPicker()}
                                                        disabled={!canEdit}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 sm:px-4"
                                                        onClick={() => setData('started_at', getLocalDateTime())}
                                                        disabled={!canEdit}
                                                    >
                                                        Teraz
                                                    </Button>
                                                </div>
                                                <InputError message={errors.started_at} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="completed_at">Data zakończenia</Label>
                                                <div className="flex gap-2">
                                                    <input
                                                        id="completed_at"
                                                        type="datetime-local"
                                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                        value={data.completed_at}
                                                        onChange={(e) => setData('completed_at', e.target.value)}
                                                        onClick={(e) => e.currentTarget.showPicker()}
                                                        min={data.started_at}
                                                        disabled={!canEdit}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 sm:px-4"
                                                        onClick={() => setData('completed_at', getLocalDateTime())}
                                                        disabled={!data.started_at || !canEdit}
                                                    >
                                                        Teraz
                                                    </Button>
                                                </div>
                                                <InputError message={errors.completed_at} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="report_summary" className="flex items-center gap-2">
                                                        <LucideMessageSquare className="h-4 w-4 text-muted-foreground" />
                                                        Podsumowanie / Notatki
                                                    </Label>
                                                    <VoiceInput
                                                        onResult={(text) => setData('report_summary', data.report_summary ? `${data.report_summary} ${text}` : text)}
                                                        disabled={!canEdit}
                                                    />
                                                </div>
                                                <Textarea
                                                    id="report_summary"
                                                    placeholder="Wpisz lub podyktuj krótkie podsumowanie wykonanych prac..."
                                                    className="min-h-[100px] resize-none"
                                                    value={data.report_summary}
                                                    onChange={(e) => setData('report_summary', e.target.value)}
                                                    disabled={!canEdit}
                                                />
                                                <InputError message={errors.report_summary} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                                        <Button variant="outline" type="button" asChild disabled={processing} className="cursor-pointer w-full sm:w-auto order-2 sm:order-1">
                                            <Link href={index()}>Anuluj</Link>
                                        </Button>
                                        {canEdit && (
                                            <Button type="submit" disabled={processing} className="cursor-pointer w-full sm:w-auto order-1 sm:order-2">
                                                {processing ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        Zapisywanie...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LucideSave className="mr-2 h-4 w-4" />
                                                        Zapisz zmiany
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        {requirements.length > 0 && job.status !== 'completed' && (
                            <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                        <LucideAlertTriangle className="h-5 w-5" />
                                        <CardTitle className="text-base font-semibold">Wymagania do zakończenia</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm">
                                                {req.met ? (
                                                    <LucideCheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <LucideCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                                <span className={req.met ? 'text-muted-foreground line-through' : 'text-foreground'}>
                                                    {req.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

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

                                        <div className="space-y-4">
                                            {selectedClient.address && (
                                                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
                                                    <LucideMapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <p className="leading-tight break-words">{selectedClient.address}</p>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 text-xs"
                                                            asChild
                                                        >
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedClient.address)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1"
                                                            >
                                                                <LucideNavigation className="h-3 w-3" />
                                                                Nawiguj
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedClient.email && (
                                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                    <LucideMail className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <a href={`mailto:${selectedClient.email}`} className="text-primary hover:underline truncate block flex-1">{selectedClient.email}</a>
                                                </div>
                                            )}
                                            {selectedClient.phone && (
                                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                    <LucidePhone className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <a href={`tel:${selectedClient.phone}`} className="text-primary hover:underline truncate block flex-1">{selectedClient.phone}</a>
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
                                            <Suspense fallback={<div style={{ height: '200px' }} className="bg-muted animate-pulse rounded-lg" />}>
                                                <JobMap
                                                    jobs={clientMapData}
                                                    height="200px"
                                                    center={[selectedClient.latitude, selectedClient.longitude]}
                                                    zoom={15}
                                                />
                                            </Suspense>
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
