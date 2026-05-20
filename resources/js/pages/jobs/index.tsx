import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LucideCalendar, LucidePlus, LucideUser, LucideTrash2 } from 'lucide-react';
import { useState } from 'react';

import { destroy as destroyAction } from '@/actions/App/Http/Controllers/JobController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
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
    };
}

interface Props {
    jobs: Job[];
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

export default function Index({ jobs }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isTechnician = user.role === 'technician';

    const [jobToDelete, setJobToDelete] = useState<number | null>(null);
    const { delete: destroy, processing } = useForm();

    const confirmDelete = () => {
        if (jobToDelete) {
            destroy(destroyAction.url({ job: jobToDelete }), {
                onSuccess: () => setJobToDelete(null),
                onFinish: () => setJobToDelete(null),
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Zlecenie #{job.id}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge className={statusColors[job.status] || 'bg-slate-500'}>
                                        {statusLabels[job.status] || job.status}
                                    </Badge>
                                    {(!isTechnician || job.technician?.id === user.id) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive cursor-pointer"
                                            onClick={() => setJobToDelete(job.id)}
                                        >
                                            <LucideTrash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <LucideUser className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">{job.client?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <LucideCalendar className="h-4 w-4" />
                                        <span>{new Date(job.scheduled_at).toLocaleDateString('pl-PL')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Technik:</span>
                                        <span>{job.technician?.name}</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full cursor-pointer" asChild>
                                        <Link href={show(job.id)}>Szczegóły</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {jobs.length === 0 && (
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
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: index() },
    ],
};
