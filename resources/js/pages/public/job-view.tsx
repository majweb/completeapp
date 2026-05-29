import { Head } from '@inertiajs/react';
import { LucideCheckCircle2, LucideCamera, LucideInfo, LucideCalendar, LucideUser, LucideMapPin, LucideCheckSquare } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface MediaItem {
    id: number;
    url: string;
}

interface ChecklistItem {
    id: string;
    label: string;
    type: 'checkbox' | 'text' | 'number' | 'select';
    value: any;
    required?: boolean;
}

interface Job {
    id: number;
    uuid: string;
    status: string;
    completed_at: string | null;
    scheduled_at: string | null;
    report_summary: string | null;
    client: {
        name: string;
        address: string | null;
    };
    technician: {
        name: string;
    };
    template: {
        name: string;
    } | null;
    company: {
        name: string;
        logo_url: string;
        address: string | null;
        phone: string | null;
        email: string | null;
    };
    checklist?: {
        content: ChecklistItem[];
    } | null;
    media: {
        before: MediaItem[];
        after: MediaItem[];
        signature: string | null;
        logo_url: string | null;
    };
}

interface Props {
    job: Job;
}

export default function PublicJobView({ job }: Props) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) {
            return '-';
        }

        return new Date(dateString).toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const ImageWithZoom = ({ src, alt }: { src: string; alt: string }) => (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative group cursor-zoom-in overflow-hidden rounded-lg border bg-muted aspect-square">
                    <img
                        src={src}
                        alt={alt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-2 rounded-full shadow-lg transition-opacity">
                            <LucideCamera className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full">
                <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
            </DialogContent>
        </Dialog>
    );

    const statusLabels: Record<string, string> = {
        new: 'Nowe',
        in_progress: 'W trakcie',
        completed: 'Zakończone',
        approved: 'Zatwierdzone',
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-12">
            <Head title={`Zlecenie #${job.id} - ${job.template?.name}`} />

            {/* Header / Brand */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {job.media.logo_url ? (
                            <img src={job.media.logo_url} alt={job.company.name} className="h-10 w-auto object-contain" />
                        ) : (
                            <span className="font-bold text-xl text-primary">{job.company.name}</span>
                        )}
                    </div>
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'} className="px-3 py-1">
                        {statusLabels[job.status] || job.status}
                    </Badge>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
                {/* Intro Card */}
                <Card className="overflow-hidden border-primary/10">
                    <div className="bg-primary/5 p-4 border-b border-primary/10">
                        <h1 className="text-xl font-bold text-foreground">Podsumowanie zlecenia #{job.id}</h1>
                        <p className="text-sm text-muted-foreground">{job.template?.name}</p>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <LucideUser className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Klient</p>
                                        <p className="font-medium">{job.client.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <LucideMapPin className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adres</p>
                                        <p className="font-medium">{job.client.address || 'Brak adresu'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <LucideCalendar className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data zakończenia</p>
                                        <p className="font-medium">{formatDate(job.completed_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <LucideCheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technik</p>
                                        <p className="font-medium">{job.technician.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Summary */}
                {job.report_summary && (
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <LucideInfo className="h-4 w-4 text-primary" />
                                Opis wykonanych prac
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                    __html: job.report_summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Photos Section */}
                {(job.media.before.length > 0 || job.media.after.length > 0) && (
                    <div className="space-y-6">
                        {job.media.after.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <LucideCamera className="h-5 w-5 text-primary" />
                                        Dokumentacja po wykonaniu prac
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {job.media.after.map((img) => (
                                            <ImageWithZoom key={img.id} src={img.url} alt="Zdjęcie po" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {job.media.before.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <LucideCamera className="h-5 w-5 text-muted-foreground" />
                                        Dokumentacja przed rozpoczęciem
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {job.media.before.map((img) => (
                                            <ImageWithZoom key={img.id} src={img.url} alt="Zdjęcie przed" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Checklist Section */}
                {job.checklist && job.checklist.content.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <LucideCheckSquare className="h-5 w-5 text-primary" />
                                Raport techniczny
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {job.checklist.content.map((item, idx) => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                                        <div className="text-sm font-semibold">
                                            {item.type === 'checkbox' ? (
                                                item.value ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">TAK</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">NIE</Badge>
                                                )
                                            ) : (
                                                <span>{item.value || '-'}</span>
                                            )}
                                        </div>
                                    </div>
                                    {idx < job.checklist!.content.length - 1 && <Separator className="bg-muted/50" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Signature Section */}
                {job.media.signature && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Potwierdzenie odbioru</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pb-8">
                            <div className="border rounded-lg p-4 bg-white max-w-sm w-full">
                                <img src={job.media.signature} alt="Podpis klienta" className="w-full h-24 object-contain" />
                                <div className="mt-4 pt-4 border-t text-center">
                                    <p className="text-xs text-muted-foreground italic">Podpisano elektronicznie</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatDate(job.completed_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Company Footer */}
                <div className="text-center pt-8 space-y-4">
                    <Separator className="max-w-[100px] mx-auto" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">{job.company.name}</p>
                        {job.company.address && <p className="text-xs text-muted-foreground">{job.company.address}</p>}
                        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                            {job.company.phone && <span>Tel: {job.company.phone}</span>}
                            {job.company.email && <span>Email: {job.company.email}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
