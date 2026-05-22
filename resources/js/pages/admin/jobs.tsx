import { Head } from '@inertiajs/react';
import { Briefcase, Building, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface JobData {
    id: number;
    status: string;
    scheduled_at: string;
    company?: {
        name: string;
    };
    client?: {
        name: string;
    };
    technician?: {
        name: string;
    };
}

interface Props {
    jobs: {
        data: JobData[];
        links: any[];
    };
}

export default function Jobs({ jobs }: Props) {
    const statusTranslations: Record<string, string> = {
        new: 'Nowe',
        in_progress: 'W trakcie',
        completed: 'Zakończone',
        approved: 'Zatwierdzone',
    };

    const statusVariants: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
        new: 'outline',
        in_progress: 'secondary',
        completed: 'default',
        approved: 'default',
    };

    return (
        <>
            <Head title="Lista zleceń - Admin" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Wszystkie zlecenia</h1>
                        <p className="text-muted-foreground">Podgląd wszystkich zleceń w systemie.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Lista zleceń
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Firma / Klient</TableHead>
                                    <TableHead>Technik</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.data.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase font-semibold">
                                                    <Building className="w-3 h-3" />
                                                    {job.company?.name || 'Brak'}
                                                </div>
                                                <span className="font-medium mt-1">{job.client?.name || 'Brak klienta'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                                {job.technician?.name || 'Nieprzypisany'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {job.scheduled_at ? new Date(job.scheduled_at).toLocaleDateString() : 'Brak'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[job.status] || 'outline'}>
                                                {statusTranslations[job.status] || job.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
