import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { pickBy } from 'lodash';
import { LucideCalendar, LucidePlus, LucideUser, LucideTrash2, LucideSearch, LucideFilter, LucideX, LucideChevronLeft, LucideChevronRight, LucideCopy } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'react-use';

import { destroy as destroyAction, duplicate as duplicateAction } from '@/actions/App/Http/Controllers/JobController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, create, show } from '@/routes/jobs';

interface Job {
    id: number;
    status: string;
    scheduled_at: string;
    client: {
        id: number;
        name: string;
    };
    technician: {
        id: number;
        name: string;
    } | null;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedJobs {
    data: Job[];
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    jobs: PaginatedJobs;
    filters: {
        search?: string;
        status?: string;
        technician_id?: string;
    };
    technicians: Array<{ id: number; name: string }>;
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    in_progress: 'bg-purple-500',
    completed: 'bg-green-500',
    approved: 'bg-slate-500',
};

const statusLabels: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

export default function Index({ jobs, filters, technicians }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isTechnician = user.role === 'technician';

    const [jobToDelete, setJobToDelete] = useState<number | null>(null);
    const [jobToDuplicate, setJobToDuplicate] = useState<number | null>(null);
    const { delete: destroy, post, processing } = useForm();

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [technicianId, setTechnicianId] = useState(filters.technician_id || 'all');

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearch(filters.search || '');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus(filters.status || 'all');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTechnicianId(filters.technician_id || 'all');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilter = useCallback(() => {
        // Nie wysyłaj filtra, jeśli wartości są takie same jak w propsach
        if (
            search === (filters.search || '') &&
            status === (filters.status || 'all') &&
            technicianId === (filters.technician_id || 'all')
        ) {
            return;
        }

        const data = pickBy(
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
                technician_id: technicianId === 'all' ? undefined : technicianId,
            },
            (value) => value !== undefined && value !== '',
        );

        router.get(index(), data, { preserveState: true, replace: true });
    }, [search, status, technicianId, filters]);

    useDebounce(
        () => {
            handleFilter();
        },
        500,
        [search, status, technicianId],
    );

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setTechnicianId('all');
        router.get(index(), {}, { preserveState: false, replace: true });
    };

    const confirmDelete = () => {
        if (jobToDelete) {
            destroy(destroyAction.url({ job: jobToDelete }), {
                onSuccess: () => setJobToDelete(null),
                onFinish: () => setJobToDelete(null),
            });
        }
    };

    const confirmDuplicate = () => {
        if (jobToDuplicate) {
            post(duplicateAction.url({ job: jobToDuplicate }), {
                onSuccess: () => setJobToDuplicate(null),
                onFinish: () => setJobToDuplicate(null),
            });
        }
    };

    return (
        <>
            <Head title="Zlecenia" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Zlecenia</h1>
                    {!isTechnician && (
                        <Button asChild className="cursor-pointer">
                            <Link href={create()}>
                                <LucidePlus className="mr-2 h-4 w-4" />
                                Nowe zlecenie
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between md:hidden">
                        <div className="relative flex-1 mr-2">
                            <LucideSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj..."
                                className="pl-9 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 cursor-pointer"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <LucideFilter className="mr-2 h-4 w-4" />
                            {showFilters ? 'Ukryj' : 'Filtry'}
                        </Button>
                    </div>

                    <div className={`${showFilters ? 'flex' : 'hidden'} flex-col gap-4 md:flex md:flex-row md:items-center`}>
                        <div className="relative flex-1 hidden md:block">
                            <LucideSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSearch('')}
                                >
                                    <LucideX className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex flex-col flex-1 gap-2 sm:flex-row">
                                <div className="w-full sm:w-[160px]">
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="w-full">
                                            <LucideFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie statusy</SelectItem>
                                            {Object.entries(statusLabels).map(([val, label]) => (
                                                <SelectItem key={val} value={val}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {!isTechnician && technicians.length > 0 && (
                                    <div className="w-full sm:w-[160px]">
                                        <Select value={technicianId} onValueChange={setTechnicianId}>
                                            <SelectTrigger className="w-full">
                                                <LucideUser className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Technik" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Wszyscy</SelectItem>
                                                {technicians.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t pt-2 sm:border-l sm:border-t-0 sm:pl-2 sm:pt-0">
                                {(search || status !== 'all' || technicianId !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 cursor-pointer w-full sm:w-auto">
                                        Wyczyść
                                    </Button>
                                )}

                                {jobs.last_page > 1 && (
                                    <div className="ml-auto flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            asChild={!!jobs.links[0].url}
                                            disabled={!jobs.links[0].url}
                                        >
                                            {jobs.links[0].url ? (
                                                <Link href={jobs.links[0].url as string}>
                                                    <LucideChevronLeft className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <LucideChevronLeft className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <div className="text-[10px] font-medium px-1 whitespace-nowrap">
                                            {jobs.current_page} / {jobs.last_page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            asChild={!!jobs.links[jobs.links.length - 1].url}
                                            disabled={!jobs.links[jobs.links.length - 1].url}
                                        >
                                            {jobs.links[jobs.links.length - 1].url ? (
                                                <Link href={jobs.links[jobs.links.length - 1].url as string}>
                                                    <LucideChevronRight className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <LucideChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {jobs.data.map((job) => (
                        <Card key={job.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground">#{job.id}</CardTitle>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className={`${statusColors[job.status] || 'bg-slate-500'} text-[9px] px-1.5 py-0 h-4 text-white border-0`}>
                                        {statusLabels[job.status] || job.status}
                                    </Badge>
                                    {!isTechnician && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer"
                                            onClick={() => setJobToDuplicate(job.id)}
                                            title="Duplikuj zlecenie"
                                        >
                                            <LucideCopy className="h-3 w-3" />
                                        </Button>
                                    )}
                                    {(!isTechnician || job.technician?.id === user.id) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive/50 hover:text-destructive cursor-pointer"
                                            onClick={() => setJobToDelete(job.id)}
                                            title="Usuń zlecenie"
                                        >
                                            <LucideTrash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <LucideUser className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-bold text-sm truncate">{job.client?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <LucideCalendar className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{new Date(job.scheduled_at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                        <span className="text-muted-foreground shrink-0">Technik:</span>
                                        <span className="font-medium truncate text-muted-foreground/80">
                                            {job.technician?.id === user.id ? 'Ty' : job.technician?.name || 'Nieprzypisany'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium cursor-pointer" asChild>
                                        <Link href={show(job.id)}>Szczegóły</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {jobs.data.length === 0 && (
                        <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            <p>Brak zleceń.</p>
                            {!isTechnician && (
                                <Button variant="link" asChild className="cursor-pointer">
                                    <Link href={create()}>Utwórz pierwsze zlecenie</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {jobs.total > 0 && jobs.last_page > 1 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-1">
                        {jobs.links.map((link, i) => {
                            if (link.url === null) {
                                return (
                                    <span
                                        key={i}
                                        className="rounded-md border px-3 py-1 text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url as string}
                                    className={`rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted ${
                                        link.active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Dialog potwierdzenia usuwania */}
            <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Czy na pewno chcesz usunąć to zlecenie?</DialogTitle>
                        <DialogDescription>
                            Ta operacja jest nieodwracalna. Wszystkie dane zlecenia, w tym checklisty i zdjęcia, zostaną usunięte.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Anuluj</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
                            Usuń zlecenie
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog potwierdzenia duplikowania */}
            <Dialog open={!!jobToDuplicate} onOpenChange={(open) => !open && setJobToDuplicate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Czy chcesz zduplikować to zlecenie?</DialogTitle>
                        <DialogDescription>
                            Zostanie utworzone nowe zlecenie z tym samym klientem, technikiem i szablonem. Data wykonania zostanie ustawiona na jutro rano.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Anuluj</Button>
                        </DialogClose>
                        <Button onClick={confirmDuplicate} disabled={processing}>
                            Zduplikuj zlecenie
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: index() },
    ],
};
