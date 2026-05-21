import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Bell, Briefcase, LucideArrowLeft, LucideCalendar, LucideUser, LucideCheckCircle2, LucideCamera, LucideFileText, LucidePlus, LucideSave, LucideCheck, LucidePencil, LucideTrash2, LucideMail, LucideUpload, LucideLoader2, LucideArrowUp, LucideArrowDown, LucideSparkles, LucideRefreshCcw, LucidePlusCircle, LucideArrowRight, Clock, MapPin } from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePad from 'signature_pad';

import { update, uploadMedia, saveSignature, deleteMedia, reorderMedia, sendReport } from '@/actions/App/Http/Controllers/JobController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { VoiceInput } from '@/components/voice-input';
import { index as indexRoute, edit as editRoute, report as reportRoute, generateSummary as generateSummaryRoute } from '@/routes/jobs';

interface MediaItem {
    id: number;
    url: string;
    original_url: string;
}

interface ChecklistItem {
    [key: string]: any;
    id: string;
    label: string;
    type: 'checkbox' | 'text' | 'number';
    value: any;
    required?: boolean;
}

interface AuditLog {
    id: number;
    event: string;
    old_values: any;
    new_values: any;
    created_at: string;
    user: {
        name: string;
    } | null;
}

interface Job {
    id: number;
    status: string;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
    report_summary: string | null;
    client: {
        name: string;
        address: string | null;
        phone: string | null;
    };
    technician: {
        name: string;
    };
    template: {
        name: string;
    };
    checklist: {
        id: number;
        content: ChecklistItem[];
    } | null;
    media: {
        images_before: MediaItem[];
        images_after: MediaItem[];
        problems: MediaItem[];
        signature: string | null;
    };
    audit_logs: AuditLog[];
}

interface Props {
    job: Job;
    twilio_enabled: boolean;
}

const statusLabels: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

export default function Show({ job, twilio_enabled }: Props) {
    const { auth, features } = usePage().props as any;
    const user = auth.user;
    const isOwnerOrManager = user.role === 'owner' || user.role === 'manager';
    const isOpenAiEnabled = features?.openai ?? false;

    const { data, setData, put, processing, errors } = useForm<{
        checklist_content: ChecklistItem[];
        status: string;
        send_sms: boolean;
    }>({
        checklist_content: job.checklist?.content || [],
        status: job.status,
        send_sms: true,
    });

    const [isSignatureOpen, setIsSignatureOpen] = useState(false);
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [uploadingCollection, setUploadingCollection] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ id: number, collection: string } | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
    const signatureRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);

    const initSignaturePad = useCallback(() => {
        if (signatureRef.current) {
            const canvas = signatureRef.current;

            // Clear any existing listeners
            if (signaturePadRef.current) {
                signaturePadRef.current.off();
            }

            const ratio = Math.max(window.devicePixelRatio || 1, 1);

            // Set internal coordinate system
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;

            const context = canvas.getContext('2d');

            if (context) {
                context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
                context.scale(ratio, ratio);
            }

            signaturePadRef.current = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)',
            });
        }
    }, []);

    useEffect(() => {
        if (isSignatureOpen) {
            // Small timeout to ensure dialog is rendered and dimensions are stable
            const timer = setTimeout(initSignaturePad, 200);

            return () => clearTimeout(timer);
        }
    }, [isSignatureOpen, initSignaturePad]);

    useEffect(() => {
        const handleResize = () => {
            if (isSignatureOpen) {
                initSignaturePad();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isSignatureOpen, initSignaturePad]);

    const saveChecklist = () => {
        put(update(job.id).url, {
            preserveScroll: true,
        } as any);
    };

    const onMediaDragStart = (e: React.DragEvent, id: number, collection: string) => {
        setDraggedItem({ id, collection });
        e.dataTransfer.effectAllowed = 'move';
        // Przezroczysty obrazek podczas przeciągania
        const target = e.currentTarget as HTMLElement;
        setTimeout(() => {
            target.style.opacity = '0.4';
        }, 0);
    };

    const onMediaDragEnd = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const onMediaDragOver = (e: React.DragEvent, id: number, collection: string) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.collection !== collection || draggedItem.id === id) {
            return;
        }

        setDragOverItem(id);
    };

    const onMediaDrop = (e: React.DragEvent, targetId: number, collection: string) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.collection !== collection || draggedItem.id === targetId) {
            return;
        }

        const items = [...(job.media[collection as keyof typeof job.media] as MediaItem[])];
        const draggedIdx = items.findIndex(i => i.id === draggedItem.id);
        const targetIdx = items.findIndex(i => i.id === targetId);

        if (draggedIdx !== -1 && targetIdx !== -1) {
            const [reorderedItem] = items.splice(draggedIdx, 1);
            items.splice(targetIdx, 0, reorderedItem);

            router.post(reorderMedia(job.id).url, {
                media_ids: items.map(i => i.id)
            }, {
                preserveScroll: true,
            });
        }

        setDraggedItem(null);
        setDragOverItem(null);
    };

    const moveMedia = (id: number, direction: 'up' | 'down', collection: string) => {
        const items = [...(job.media[collection as keyof typeof job.media] as MediaItem[])];
        const currentIndex = items.findIndex(i => i.id === id);

        if (currentIndex === -1) {
            return;
        }

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex >= 0 && newIndex < items.length) {
            const [movedItem] = items.splice(currentIndex, 1);
            items.splice(newIndex, 0, movedItem);

            router.post(reorderMedia(job.id).url, {
                media_ids: items.map(i => i.id)
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, collection: string) => {
        let file: File | undefined;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('collection', collection);

            router.post(uploadMedia(job.id).url, formData, {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setUploadingCollection(collection);
                },
                onSuccess: () => {
                    // Inertia automatycznie przeładuje propsy, co odświeży listę zdjęć
                },
                onError: (errors) => {
                    console.error('Upload error:', errors);
                    alert('Błąd podczas przesyłania zdjęcia.');
                },
                onFinish: () => {
                    setUploadingCollection(null);
                }
            });

            if ('value' in e.target) {
                (e.target as HTMLInputElement).value = '';
            }
        }

        setDragOver(null);
    };

    const onDragOver = (e: React.DragEvent, collection: string) => {
        e.preventDefault();
        setDragOver(collection);
    };

    const onDragLeave = () => {
        setDragOver(null);
    };

    const onDrop = (e: React.DragEvent, collection: string) => {
        e.preventDefault();
        handleFileUpload(e, collection);
    };

    const handleDeleteMedia = () => {
        if (mediaToDelete) {
            router.delete(deleteMedia({ job: job.id, media: mediaToDelete }).url, {
                preserveScroll: true,
                onSuccess: () => setMediaToDelete(null),
            });
        }
    };


    const handleSendReport = () => {
        router.post(sendReport.url({ job: job.id }), {}, {
            onSuccess: () => {
                // Toast is handled by backend flash
            },
        });
    };

    const handleSaveSignature = () => {
        if (signaturePadRef.current?.isEmpty()) {
            return;
        }

        const signature = signaturePadRef.current?.toDataURL();
        router.post(saveSignature(job.id).url, { signature }, {
            preserveScroll: true,
            onSuccess: () => setIsSignatureOpen(false),
        });
    };

    const handleGenerateAISummary = () => {
        router.post(generateSummaryRoute(job.id).url, {}, {
            preserveScroll: true,
        });
    };

    const updateChecklist = (index: number, value: any) => {
        const newContent = [...data.checklist_content];
        newContent[index].value = value;
        setData('checklist_content', newContent);
    };

    const finishJob = () => {
        router.put(update(job.id).url, {
            checklist_content: data.checklist_content,
            status: 'completed',
            send_sms: data.send_sms,
        }, {
            onSuccess: () => setIsFinishDialogOpen(false),
            onError: () => {
                setIsFinishDialogOpen(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Zlecenie #${job.id}`} />

            <Dialog open={mediaToDelete !== null} onOpenChange={(open) => !open && setMediaToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Czy na pewno chcesz usunąć to zdjęcie?</DialogTitle>
                        <DialogDescription>
                            Ta operacja jest nieodwracalna. Zdjęcie zostanie trwale usunięte z serwera.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMediaToDelete(null)} className="cursor-pointer">Anuluj</Button>
                        <Button variant="destructive" onClick={handleDeleteMedia} className="cursor-pointer">Usuń</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Czy na pewno chcesz zakończyć zlecenie?</DialogTitle>
                        <DialogDescription>
                            Zlecenie zostanie oznaczone jako zakończone. Upewnij się, że wszystkie dane i zdjęcia zostały dodane.
                        </DialogDescription>
                    </DialogHeader>
                    {job.client.phone && twilio_enabled && (
                        <div className="flex items-center space-x-2 py-4">
                            <Checkbox
                                id="send_sms"
                                checked={data.send_sms}
                                onCheckedChange={(checked) => setData('send_sms', !!checked)}
                            />
                            <Label
                                htmlFor="send_sms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Wyślij powiadomienie SMS do klienta ({job.client.phone})
                            </Label>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)} className="cursor-pointer">Anuluj</Button>
                        <Button className="bg-green-600 hover:bg-green-700 cursor-pointer" onClick={finishJob}>Zakończ zlecenie</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild className="cursor-pointer">
                                <Link href={indexRoute().url}>
                                    <LucideArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Zlecenie #{job.id}</h1>
                                <p className="text-sm text-muted-foreground">{job.template?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isOwnerOrManager && (
                                <Button variant="outline" size="sm" asChild className="cursor-pointer">
                                    <Link href={editRoute(job.id).url}>
                                        <LucidePencil className="mr-2 h-4 w-4" />
                                        Edytuj
                                    </Link>
                                </Button>
                            )}
                            <Badge variant="outline" className="text-sm px-3 py-1 uppercase tracking-wider bg-background">
                                {statusLabels[job.status] || job.status}
                            </Badge>
                        </div>
                    </div>

                {job.status === 'new' && (
                    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mb-2">
                        <div className="flex items-center gap-5">
                            <div className="bg-primary p-4 rounded-2xl shadow-lg rotate-3">
                                <LucideSparkles className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Gotowy do rozpoczęcia?</h3>
                                <p className="text-muted-foreground max-w-md">Rozpocznij zlecenie, aby odblokować checklistę, dodać dokumentację fotograficzną i zarejestrować czas pracy.</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.put(update(job.id).url, { status: 'in_progress' })}
                            size="lg"
                            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-16 px-10 text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all group"
                        >
                            <LucidePlusCircle className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                            ROZPOCZNIJ PRACĘ
                            <LucideArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Checklist Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <LucideCheckCircle2 className="h-5 w-5 text-primary" />
                                    Checklista
                                </CardTitle>
                                <Button size="sm" variant="outline" onClick={saveChecklist} disabled={processing || !job.started_at} className="cursor-pointer">
                                    <LucideSave className="mr-2 h-4 w-4" />
                                    Zapisz postęp
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6 relative">
                                {!job.started_at && (
                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-lg">
                                        <div className="bg-card border shadow-sm p-4 rounded-lg text-center max-w-xs mx-4">
                                            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Rozpocznij zlecenie powyżej, aby móc wypełniać checklistę.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data.checklist_content.map((item, index) => (
                                    <div key={item.id} className="flex flex-col gap-2">
                                        <div className="flex items-start gap-3">
                                            {item.type === 'checkbox' ? (
                                                <div className="w-full">
                                                    <div
                                                        className={`flex items-center gap-3 py-2 transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => job.started_at && updateChecklist(index, !item.value)}
                                                    >
                                                        <Checkbox
                                                            id={item.id}
                                                            checked={!!item.value}
                                                            onCheckedChange={(checked) => job.started_at && updateChecklist(index, !!checked)}
                                                            className={`${(errors as any)[`checklist_content.${index}.value`] ? 'border-destructive' : ''}`}
                                                            disabled={!job.started_at}
                                                        />
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <Label
                                                                htmlFor={item.id}
                                                                className={`text-sm font-medium leading-none ${!job.started_at ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                {item.label}
                                                                {item.required && <span className="text-red-500 ml-1">*</span>}
                                                            </Label>
                                                            {!!item.value && <LucideCheck className="h-4 w-4 text-green-600" />}
                                                        </div>
                                                    </div>
                                                    {(errors as any)[`checklist_content.${index}.value`] && (
                                                        <p className="text-xs text-destructive mt-1.5 ml-11 font-medium">
                                                            {(errors as any)[`checklist_content.${index}.value`]}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full space-y-2">
                                                    <Label htmlFor={item.id} className="text-sm font-semibold">
                                                        {item.label}
                                                        {item.required && <span className="text-red-500 ml-1">*</span>}
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id={item.id}
                                                            type={item.type === 'number' ? 'number' : 'text'}
                                                            className={`${item.type === 'text' ? 'pr-12' : ''} ${(errors as any)[`checklist_content.${index}.value`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                            value={item.value || ''}
                                                            onChange={(e) => updateChecklist(index, e.target.value)}
                                                            required={item.required}
                                                            placeholder={item.type === 'number' ? '0' : 'Wpisz treść...'}
                                                            disabled={!job.started_at}
                                                        />
                                                        {item.type === 'text' && (
                                                            <VoiceInput
                                                                onResult={(text) => {
                                                                    if (!job.started_at) {
                                                                        return;
                                                                    }

                                                                    const val = item.value || '';
                                                                    updateChecklist(index, val + (val ? ' ' : '') + text);
                                                                }}
                                                                className={`absolute right-1 top-1/2 -translate-y-1/2 ${!job.started_at ? 'pointer-events-none opacity-50' : ''}`}
                                                                disabled={!job.started_at}
                                                            />
                                                        )}
                                                    </div>
                                                    {(errors as any)[`checklist_content.${index}.value`] && (
                                                        <p className="text-xs text-destructive font-medium">
                                                            {(errors as any)[`checklist_content.${index}.value`]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {data.checklist_content.length === 0 && (
                                    <p className="text-center text-muted-foreground italic">Brak elementów checklisty.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Media Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="md:col-span-1">
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LucideCamera className="h-4 w-4" />
                                        Zdjęcia PRZED
                                    </CardTitle>
                                    <Label htmlFor="upload-before" className="cursor-pointer p-1 hover:bg-muted rounded-full">
                                        <LucidePlus className="h-4 w-4" />
                                        <input id="upload-before" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'images_before')} />
                                    </Label>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div
                                        className={`grid grid-cols-3 gap-2 p-2 rounded-lg border-2 border-dashed transition-colors ${dragOver === 'images_before' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                        onDragOver={(e) => onDragOver(e, 'images_before')}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, 'images_before')}
                                    >
                                        {job.media.images_before.map((m, idx) => (
                                            <div
                                                key={m.id}
                                                draggable
                                                onDragStart={(e) => onMediaDragStart(e, m.id, 'images_before')}
                                                onDragEnd={onMediaDragEnd}
                                                onDragOver={(e) => onMediaDragOver(e, m.id, 'images_before')}
                                                onDrop={(e) => onMediaDrop(e, m.id, 'images_before')}
                                                className={`relative group aspect-square rounded-md overflow-hidden border bg-muted shadow-sm transition-all duration-200 cursor-move ${dragOverItem === m.id ? 'scale-105 ring-2 ring-primary ring-offset-2 z-10' : ''}`}
                                            >
                                                <img src={m.url} alt="Przed" className="h-full w-full object-cover pointer-events-none" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex gap-1">
                                                        {idx > 0 && (
                                                            <Button variant="secondary" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => moveMedia(m.id, 'up', 'images_before')}>
                                                                <LucideArrowUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        {idx < job.media.images_before.length - 1 && (
                                                            <Button variant="secondary" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => moveMedia(m.id, 'down', 'images_before')}>
                                                                <LucideArrowDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Button variant="destructive" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => setMediaToDelete(m.id)}>
                                                        <LucideTrash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <label
                                            htmlFor="upload-before-grid"
                                            className={`flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted cursor-pointer transition-colors ${uploadingCollection === 'images_before' ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {uploadingCollection === 'images_before' ? (
                                                <LucideLoader2 className="h-5 w-5 text-primary animate-spin" />
                                            ) : (
                                                <LucideUpload className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <span className="text-[10px] mt-1 text-muted-foreground font-medium text-center px-1">
                                                {uploadingCollection === 'images_before' ? 'Przesyłanie...' : 'Dodaj lub upuść'}
                                            </span>
                                            <input id="upload-before-grid" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'images_before')} disabled={!!uploadingCollection} />
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-1">
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LucideCamera className="h-4 w-4" />
                                        Zdjęcia PO
                                    </CardTitle>
                                    <Label htmlFor="upload-after" className="cursor-pointer p-1 hover:bg-muted rounded-full">
                                        <LucidePlus className="h-4 w-4" />
                                        <input id="upload-after" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'images_after')} />
                                    </Label>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div
                                        className={`grid grid-cols-3 gap-2 p-2 rounded-lg border-2 border-dashed transition-colors ${dragOver === 'images_after' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                        onDragOver={(e) => onDragOver(e, 'images_after')}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, 'images_after')}
                                    >
                                        {job.media.images_after.map((m, idx) => (
                                            <div
                                                key={m.id}
                                                draggable
                                                onDragStart={(e) => onMediaDragStart(e, m.id, 'images_after')}
                                                onDragEnd={onMediaDragEnd}
                                                onDragOver={(e) => onMediaDragOver(e, m.id, 'images_after')}
                                                onDrop={(e) => onMediaDrop(e, m.id, 'images_after')}
                                                className={`relative group aspect-square rounded-md overflow-hidden border bg-muted shadow-sm transition-all duration-200 cursor-move ${dragOverItem === m.id ? 'scale-105 ring-2 ring-primary ring-offset-2 z-10' : ''}`}
                                            >
                                                <img src={m.url} alt="Po" className="h-full w-full object-cover pointer-events-none" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex gap-1">
                                                        {idx > 0 && (
                                                            <Button variant="secondary" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => moveMedia(m.id, 'up', 'images_after')}>
                                                                <LucideArrowUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        {idx < job.media.images_after.length - 1 && (
                                                            <Button variant="secondary" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => moveMedia(m.id, 'down', 'images_after')}>
                                                                <LucideArrowDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Button variant="destructive" size="icon" className="h-7 w-7 cursor-pointer shadow-md" onClick={() => setMediaToDelete(m.id)}>
                                                        <LucideTrash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <label
                                            htmlFor="upload-after-grid"
                                            className={`flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted cursor-pointer transition-colors ${uploadingCollection === 'images_after' ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {uploadingCollection === 'images_after' ? (
                                                <LucideLoader2 className="h-5 w-5 text-primary animate-spin" />
                                            ) : (
                                                <LucideUpload className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <span className="text-[10px] mt-1 text-muted-foreground font-medium text-center px-1">
                                                {uploadingCollection === 'images_after' ? 'Przesyłanie...' : 'Dodaj lub upuść'}
                                            </span>
                                            <input id="upload-after-grid" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'images_after')} disabled={!!uploadingCollection} />
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LucideFileText className="h-4 w-4" />
                                        Podpis klienta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    {job.media.signature ? (
                                        <div className="border rounded-md p-2 bg-white">
                                            <img src={job.media.signature} alt="Podpis" className="h-20 w-full object-contain" />
                                            <p className="text-[10px] text-center text-muted-foreground mt-1">Podpisano</p>
                                        </div>
                                    ) : (
                                        <Dialog open={isSignatureOpen} onOpenChange={setIsSignatureOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="secondary" className="w-full h-24 border-2 border-dashed flex-col cursor-pointer">
                                                    <LucidePencil className="h-6 w-6 mb-1" />
                                                    Zbierz podpis
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Podpis klienta</DialogTitle>
                                                </DialogHeader>
                                                <div className="bg-white border rounded-lg overflow-hidden">
                                                    <canvas ref={signatureRef} className="w-full h-80 touch-none cursor-crosshair" />
                                                </div>
                                                <div className="flex justify-between gap-2 mt-4">
                                                    <Button variant="outline" onClick={() => signaturePadRef.current?.clear()} className="cursor-pointer">Wyczyść</Button>
                                                    <Button onClick={handleSaveSignature} className="cursor-pointer">Zapisz podpis</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardContent>
                             </Card>
                        </div>

                        {/* AI Summary Section */}
                        {isOpenAiEnabled && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <LucideSparkles className="h-5 w-5 text-purple-500" />
                                        Podsumowanie AI
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGenerateAISummary}
                                        disabled={processing}
                                        className="cursor-pointer"
                                    >
                                        {job.report_summary ? (
                                            <>
                                                <LucideRefreshCcw className="mr-2 h-4 w-4" />
                                                Odśwież AI
                                            </>
                                        ) : (
                                            <>
                                                <LucideSparkles className="mr-2 h-4 w-4" />
                                                Generuj AI
                                            </>
                                        )}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {job.report_summary ? (
                                        <div className="bg-muted/30 p-4 rounded-lg border italic text-sm leading-relaxed whitespace-pre-wrap">
                                            {job.report_summary}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Brak podsumowania. Kliknij przycisk powyżej, aby wygenerować automatyczne podsumowanie pracy na podstawie checklisty.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* History Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <LucideFileText className="h-5 w-5 text-muted-foreground" />
                                    Historia zmian
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {job.audit_logs.length > 0 ? (
                                        job.audit_logs.map((log) => {
                                            const formatValue = (key: string, value: any) => {
                                                if (value === null || value === undefined) {
                                                    return <span className="text-muted-foreground italic">brak</span>;
                                                }

                                                if (key === 'status') {
                                                    const statusLabelsMap: Record<string, string> = {
                                                        'new': 'Nowe',
                                                        'in_progress': 'W trakcie',
                                                        'completed': 'Zakończone',
                                                        'approved': 'Zatwierdzone'
                                                    };

                                                    return <Badge variant="outline" className="text-[10px] py-0 h-4">{statusLabelsMap[value] || value}</Badge>;
                                                }

                                                if (key.endsWith('_at') && typeof value === 'string') {
                                                    try {
                                                        return new Date(value).toLocaleString('pl-PL', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        });
                                                    } catch {
                                                        return value;
                                                    }
                                                }

                                                return typeof value === 'object' ? JSON.stringify(value) : String(value);
                                            };

                                            const getFieldLabel = (key: string) => {
                                                const fieldLabels: Record<string, string> = {
                                                    'status': 'Status',
                                                    'assigned_to': 'Technik',
                                                    'client_id': 'Klient',
                                                    'template_id': 'Szablon',
                                                    'scheduled_at': 'Planowana data',
                                                    'started_at': 'Data rozpoczęcia',
                                                    'completed_at': 'Data zakończenia',
                                                    'report_summary': 'Podsumowanie'
                                                };

                                                return fieldLabels[key] || key;
                                            };

                                            return (
                                                <div key={log.id} className="text-sm border-l-2 border-muted pl-4 py-2 relative group hover:bg-muted/30 transition-colors rounded-r-md">
                                                    <div className="absolute -left-[9px] top-3 h-4 w-4 rounded-full border-2 border-background bg-muted group-hover:bg-primary/30 transition-colors" />
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                            {log.event === 'created' ? (
                                                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                    <LucidePlusCircle className="h-3 w-3" /> Utworzono
                                                                </span>
                                                            ) : log.event === 'updated' ? (
                                                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                                    <LucidePencil className="h-3 w-3" /> Zaktualizowano
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                                                    <LucideTrash2 className="h-3 w-3" /> Usunięto
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground/70">
                                                            {new Date(log.created_at).toLocaleString('pl-PL')}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs mb-2">
                                                        <span className="text-muted-foreground font-normal">Przez: </span>
                                                        <span className="font-semibold text-foreground">{log.user?.name || 'System'}</span>
                                                    </div>
                                                    {log.event === 'updated' && log.new_values && (
                                                        <div className="mt-2 space-y-1.5 bg-background/50 p-2 rounded border border-muted/50">
                                                            {Object.keys(log.new_values).map((key) => (
                                                                <div key={key} className="text-[11px] grid grid-cols-[80px_1fr] gap-2 items-baseline">
                                                                    <span className="font-medium text-muted-foreground truncate" title={getFieldLabel(key)}>
                                                                        {getFieldLabel(key)}:
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-muted-foreground line-through opacity-70">
                                                                            {formatValue(key, log.old_values?.[key])}
                                                                        </span>
                                                                        <LucideArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                                        <span className="font-medium text-foreground">
                                                                            {formatValue(key, log.new_values[key])}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-2">Brak wpisów w historii.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Info Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informacje</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase">Klient</Label>
                                    <p className="font-semibold">{job.client?.name}</p>
                                    <p className="text-sm">{job.client?.address}</p>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase">Termin</Label>
                                    <div className="flex items-center gap-2">
                                        <LucideCalendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {new Date(job.scheduled_at).toLocaleDateString('pl-PL')}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                {job.started_at && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase">Rozpoczęto</Label>
                                            <div className="flex items-center gap-2">
                                                <LucideCalendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                    {new Date(job.started_at).toLocaleString('pl-PL')}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                {job.completed_at && (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground uppercase">Zakończono</Label>
                                            <div className="flex items-center gap-2">
                                                <LucideCalendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                    {new Date(job.completed_at).toLocaleString('pl-PL')}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase">Technik</Label>
                                    <div className="flex items-center gap-2">
                                        <LucideUser className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{job.technician?.name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Section */}
                        <div className="space-y-2">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                                onClick={() => setIsFinishDialogOpen(true)}
                                disabled={job.status === 'completed' || job.status === 'approved'}
                            >
                                <LucideCheck className="mr-2 h-4 w-4" />
                                Zakończ zlecenie
                            </Button>
                            <Button variant="outline" className="w-full cursor-pointer" asChild>
                                <a href={reportRoute(job.id).url} target="_blank" rel="noreferrer">
                                    <LucideFileText className="mr-2 h-4 w-4" />
                                    Podgląd raportu PDF
                                </a>
                            </Button>
                            <Button variant="secondary" className="w-full cursor-pointer" onClick={handleSendReport}>
                                <LucideMail className="mr-2 h-4 w-4" />
                                Wyślij do klienta
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Zlecenia', href: indexRoute().url },
        { title: 'Szczegóły', href: '#' },
    ],
};
