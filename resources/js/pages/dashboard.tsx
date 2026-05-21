import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Briefcase, CheckCircle, Clock, MapPin, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

import { show as jobShow } from '@/actions/App/Http/Controllers/JobController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

const STATUS_LABELS: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

const STATUS_COLORS: Record<string, string> = {
    new: '#3b82f6', // blue-500
    in_progress: '#a855f7', // purple-500
    completed: '#22c55e', // green-500
    approved: '#64748b', // slate-500
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
        latest_job_id: number;
    };
    activity_data: { date: string; count: number }[];
    recent_jobs: any[];
    next_jobs: any[];
}

export default function Dashboard({ stats, activity_data, recent_jobs, next_jobs }: DashboardProps) {
    const { auth } = usePage<any>().props;
    const isTechnician = auth.user.role === 'technician';
    const [lastKnownJobId, setLastKnownJobId] = useState(stats.latest_job_id);
    const [hasNewJobs, setHasNewJobs] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['stats'],
                onSuccess: (page) => {
                    const newLatestId = (page.props.stats as any).latest_job_id;
                    if (newLatestId > lastKnownJobId) {
                        setHasNewJobs(true);
                    }
                },
            });
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [lastKnownJobId]);

    const handleRefresh = () => {
        router.reload();
        setHasNewJobs(false);
        setLastKnownJobId(stats.latest_job_id);
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {hasNewJobs && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative flex items-center justify-between shadow-sm animate-pulse">
                        <div className="flex items-center">
                            <Bell className="h-5 w-5 mr-2" />
                            <span className="font-medium text-sm">Pojawiły się nowe zlecenia w systemie!</span>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Odśwież
                        </button>
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Wszystkie Zlecenia" value={stats.total_jobs} icon={<Briefcase />} />
                    <StatCard title="Aktywne Zlecenia" value={stats.active_jobs} icon={<Clock />} />
                    <StatCard title="Ukończone Dzisiaj" value={stats.completed_today} icon={<CheckCircle />} />
                    <StatCard title="Wszyscy Klienci" value={stats.total_clients} icon={<Users />} />
                </div>

                {isTechnician && next_jobs.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-1">
                        <Card className="border-blue-200 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Twoje najbliższe zadania</CardTitle>
                                <CardDescription>Szybki dostęp do przypisanych zleceń</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                {next_jobs.map((job) => (
                                    <div key={job.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={job.status === 'in_progress' ? 'default' : 'secondary'}>
                                                    {STATUS_LABELS[job.status]}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(job.scheduled_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{job.client.name}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {job.client.address}
                                            </p>
                                        </div>
                                        <Button asChild size="sm" className="mt-4 w-full">
                                            <Link href={jobShow.url({ job: job.id })}>
                                                Otwórz zlecenie
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                    <Card className="col-span-1 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Aktywność (Ostatnie 30 dni)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activity_data}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            name="Liczba zleceń"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Statusy Zleceń</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
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
                        </CardContent>
                    </Card>
                </div>

                <Card>
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
