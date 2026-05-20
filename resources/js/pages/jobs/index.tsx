import { Head, Link } from '@inertiajs/react';
import { LucideCalendar, LucidePlus, LucideUser } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    assigned: 'bg-yellow-500',
    in_progress: 'bg-purple-500',
    completed: 'bg-green-500',
    approved: 'bg-slate-500',
};

const statusLabels: Record<string, string> = {
    new: 'Nowe',
    assigned: 'Przypisane',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

export default function Index({ jobs }: Props) {
    return (
        <>
            <Head title="Zlecenia" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Zlecenia</h1>
                    <Button asChild className="cursor-pointer">
                        <Link href={create()}>
                            <LucidePlus className="mr-2 h-4 w-4" />
                            Nowe zlecenie
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Zlecenie #{job.id}</CardTitle>
                                <Badge className={statusColors[job.status] || 'bg-slate-500'}>
                                    {statusLabels[job.status] || job.status}
                                </Badge>
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
                            <Button variant="link" asChild className="cursor-pointer">
                                <Link href={create()}>Utwórz pierwsze zlecenie</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: index() },
    ],
};
