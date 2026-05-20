import { Head, Link } from '@inertiajs/react';
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

import { show as jobShow } from '@/actions/App/Http/Controllers/JobController';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

const STATUS_LABELS: Record<string, string> = {
    new: 'Nowe',
    assigned: 'Przypisane',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
    cancelled: 'Anulowane',
};

const STATUS_COLORS: Record<string, string> = {
    new: '#3b82f6', // blue-500
    assigned: '#f59e0b', // amber-500
    in_progress: '#a855f7', // purple-500
    completed: '#22c55e', // green-500
    approved: '#64748b', // slate-500
    cancelled: '#ef4444', // red-500
};

interface StatProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
}

function StatCard({ title, value, icon, description }: StatProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground h-4 w-4">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </CardContent>
        </Card>
    );
}

interface DashboardProps {
    stats: {
        total_jobs: number;
        active_jobs: number;
        completed_today: number;
        total_clients: number;
        jobs_by_status: Record<string, number>;
    };
    recent_jobs: any[];
}

export default function Dashboard({ stats, recent_jobs }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Wszystkie Zlecenia" value={stats.total_jobs} icon={<Briefcase />} />
                    <StatCard title="Aktywne Zlecenia" value={stats.active_jobs} icon={<Clock />} />
                    <StatCard title="Ukończone Dzisiaj" value={stats.completed_today} icon={<CheckCircle />} />
                    <StatCard title="Wszyscy Klienci" value={stats.total_clients} icon={<Users />} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Ostatnie Zlecenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_jobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <Link href={jobShow.url({ job: job.id })} className="font-medium hover:underline">
                                                {job.template?.name || 'Zlecenie bez szablonu'}
                                            </Link>
                                            <p className="text-muted-foreground text-sm">{job.client?.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                                                {STATUS_LABELS[job.status] || job.status}
                                            </Badge>
                                            <div className="text-muted-foreground text-xs">{new Date(job.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {recent_jobs.length === 0 && <p className="text-muted-foreground text-center py-4">Brak ostatnich zleceń.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Statusy Zleceń</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(stats.jobs_by_status).map(([status, count]) => ({
                                                name: STATUS_LABELS[status] || status,
                                                value: count,
                                                color: STATUS_COLORS[status] || '#cbd5e1',
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {Object.entries(stats.jobs_by_status).map(([status], index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[status] || '#cbd5e1'} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {Object.entries(stats.jobs_by_status).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="text-sm capitalize">{STATUS_LABELS[status] || status}</span>
                                        <Badge variant="outline">{count}</Badge>
                                    </div>
                                ))}
                                {Object.keys(stats.jobs_by_status).length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">Brak danych o statusach.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
