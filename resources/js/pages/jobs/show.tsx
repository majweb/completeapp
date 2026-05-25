import { Head, Link, useForm, router } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { Bell, LucideArrowLeft, LucideCalendar, LucideUser, LucideCheckCircle2, LucideCamera, LucideFileText, LucidePlus, LucideSave, LucideCheck, LucidePencil, LucideTrash2, LucideMail, LucideUpload, LucideLoader2, LucideArrowUp, LucideArrowDown, LucideSparkles, LucideRefreshCcw, LucidePlusCircle, LucideArrowRight, Clock, LucideExternalLink, LucideSearch, LucideCopy } from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePad from 'signature_pad';

import { update, uploadMedia, saveSignature, deleteMedia, reorderMedia, sendReport, requestSignature } from '@/actions/App/Http/Controllers/JobController';
import JobMap from '@/components/job-map';
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

import type { PageProps } from '@/types';

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
    auditable_type: string;
    auditable_id: number;
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
    uuid: string;
    status: string;
    scheduled_at: string;
    started_at: string | null;
    completed_at: string | null;
    report_summary: string | null;
    client: {
        name: string;
        address: string | null;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
    };
    technician: {
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
    template: {
        name: string;
        require_photo_before: boolean;
        require_photo_after: boolean;
        require_signature: boolean;
    };
    audit_logs: AuditLog[];
}

interface Props extends PageProps {
    job: Job;
    twilio_enabled: boolean;
    is_ready_for_signature: boolean;
    features?: {
        openai?: boolean;
    };
}

const statusLabels: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

export default function Show({ job, twilio_enabled, is_ready_for_signature, auth, features }: Props) {
    const user = auth.user as any;
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
    const [isSignatureSaving, setIsSignatureSaving] = useState(false);
    const [isDeclarationAccepted, setIsDeclarationAccepted] = useState(false);
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [uploadingCollection, setUploadingCollection] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ id: number, collection: string } | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const requiredFields = data.checklist_content.filter(i => i.required);
    const completedRequired = requiredFields.filter(i => i.value !== null && i.value !== '' && i.value !== false);
    const isFullyCompleted = requiredFields.length > 0 && completedRequired.length === requiredFields.length;
    const hasUnsavedChanges = JSON.stringify(data.checklist_content) !== JSON.stringify(job.checklist?.content || []);

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
            onSuccess: () => {
                // Toast success handled by backend flash
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, collection: string) => {
        let file: File | undefined;

        if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            file = e.dataTransfer.files[0];
        }

        if (file) {
            setUploadingCollection(collection);

            try {
                // Konfiguracja kompresji
                const options = {
                    maxSizeMB: 2, // Maksymalny rozmiar pliku
                    maxWidthOrHeight: 2048, // Maksymalna szerokość/wysokość
                    useWebWorker: true,
                };

                // Jeśli to obrazek, kompresujemy go
                let fileToUpload = file;

                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                    try {
                        fileToUpload = await imageCompression(file, options);
                        // Zachowaj oryginalną nazwę pliku
                        fileToUpload = new File([fileToUpload], file.name, {
                            type: fileToUpload.type,
                            lastModified: Date.now(),
                        });
                    } catch (compressionError) {
                        console.error('Compression error:', compressionError);
                        // W razie błędu kompresji wysyłamy oryginał
                    }
                }

                const formData = new FormData();
                formData.append('image', fileToUpload);
                formData.append('collection', collection);

                router.post(uploadMedia(job.id).url, formData, {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Inertia automatycznie przeładuje propsy, co odświeży listę zdjęć
                        if (collection === 'images_before') {
                            delete (errors as any)['media.images_before'];
                        }

                        if (collection === 'images_after') {
                            delete (errors as any)['media.images_after'];
                        }
                    },
                    onError: (errors) => {
                        console.error('Upload error:', errors);
                        alert('Błąd podczas przesyłania zdjęcia.');
                    },
                    onFinish: () => {
                        setUploadingCollection(null);
                    }
                });
            } catch (error) {
                console.error('Error in handleFileUpload:', error);
                setUploadingCollection(null);
                alert('Wystąpił nieoczekiwany błąd.');
            }

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

        setIsSignatureSaving(true);

        // Use router.post for media but manually sync errors if needed,
        // or rely on finishJob to trigger backend validation
        router.post(saveSignature(job.id).url, { signature }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSignatureOpen(false);
                // Clear specific signature error from useForm errors
                delete (errors as any)['media.signature'];
            },
            onError: (errs) => {
                // Manually sync errors from router to useForm if needed
                Object.assign(errors, errs);
            },
            onFinish: () => {
                setIsSignatureSaving(false);
            }
        });
    };

    const handleRequestSignature = () => {
        router.post(requestSignature(job.id).url, {}, {
            preserveScroll: true,
        });
    };

    const handleGenerateAISummary = () => {
        router.post(generateSummaryRoute(job.id).url, {}, {
            preserveScroll: true,
        });
    };

    const handleCopyPublicLink = () => {
        const url = window.location.origin + '/view/job/' + job.uuid;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateChecklist = (index: number, value: any) => {
        const newContent = [...data.checklist_content];
        newContent[index].value = value;
        setData('checklist_content', newContent);
    };

    const finishJob = () => {
        // Force status to completed for backend validation
        setData('status', 'completed');

        // Small delay to ensure state is updated before submit
        setTimeout(() => {
            put(update(job.id).url, {
                onSuccess: () => setIsFinishDialogOpen(false),
                onError: (errs) => {
                    setIsFinishDialogOpen(false);
                    console.error('Finish job errors:', errs);
                },
                preserveScroll: true,
            });
        }, 50);
    };

    const isChecklistComplete = () => {
        if (!job.checklist) {
            return true;
        }

        return job.checklist.content.every((item: ChecklistItem) => {
            if (!item.required) {
                return true;
            }

            return item.value !== null && item.value !== '' && item.value !== false;
        });
    };

    const canFinish = job.started_at !== null;
    const canViewReport = (job.status === 'completed' || job.status === 'approved') && isChecklistComplete();

    return (
        <>
            <Head title={`Zlecenie #${job.id}`} />

            <Dialog open={mediaToDelete !== null} onOpenChange={(open) => !open && setMediaToDelete(null)}>
                <DialogContent className="[&>button]:cursor-pointer">
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

            <Dialog open={previewImage !== null} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:cursor-pointer [&>button]:bg-white/20 [&>button]:hover:bg-white/40 [&>button]:rounded-full [&>button]:text-white z-[9999]">
                    {previewImage && (
                        <div className="relative flex items-center justify-center p-4 min-h-[300px]">
                            <img
                                src={previewImage}
                                alt="Podgląd zdjęcia"
                                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
                <DialogContent className="[&>button]:cursor-pointer">
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0 cursor-pointer">
                            <Link href={indexRoute().url}>
                                <LucideArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Zlecenie #{job.id}</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{job.template?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-2">
                        {isOwnerOrManager && (
                            <Button variant="outline" size="sm" asChild className="h-9 px-3 cursor-pointer">
                                <Link href={editRoute(job.id).url}>
                                    <LucidePencil className="mr-2 h-4 w-4" />
                                    Edytuj
                                </Link>
                            </Button>
                        )}
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-1 uppercase tracking-wider bg-background whitespace-nowrap">
                            {statusLabels[job.status] || job.status}
                        </Badge>
                    </div>
                </div>

                {(errors as any)['media.images_before'] || (errors as any)['media.images_after'] || (errors as any)['media.signature'] ? (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-2 flex items-start gap-3">
                        <Bell className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-destructive">Wymagania zlecenia nie zostały spełnione</h4>
                            <ul className="text-sm text-destructive list-disc list-inside">
                                { (errors as any)['media.images_before'] && <li>{ (errors as any)['media.images_before']}</li>}
                                { (errors as any)['media.images_after'] && <li>{ (errors as any)['media.images_after']}</li>}
                                { (errors as any)['media.signature'] && <li>{ (errors as any)['media.signature']}</li>}
                            </ul>
                        </div>
                    </div>
                ) : null}

                {!job.started_at && (
                        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm mb-2">
                            <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
                                <div className="bg-primary p-3 sm:p-4 rounded-2xl shadow-lg rotate-3 shrink-0">
                                    <LucideSparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Gotowy?</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md">Rozpocznij zlecenie, aby odblokować checklistę.</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => router.put(update(job.id).url, { status: 'in_progress' })}
                                size="lg"
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 sm:h-16 px-6 sm:px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all group"
                            >
                                <LucidePlusCircle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
                                ROZPOCZNIJ PRACĘ
                                <LucideArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </div>
                )}
                {/* History Section (Collapsible) - Moved to top */}
                <Card className="mb-2 overflow-hidden">
                    <button
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <CardTitle className="text-base sm:text-lg m-0 flex items-center gap-2">
                                                    Historia zmian ({job.audit_logs.length})
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <LucideFileText className="h-4 w-4 text-muted-foreground" />
                                                    {isHistoryExpanded ? (
                                                        <LucideArrowUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <LucideArrowDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                    </button>
                    {isHistoryExpanded && (
                        <CardContent className="pt-0 border-t">
                            <div className="space-y-4 pt-4">
                                {job.audit_logs.length > 0 ? (
                                    job.audit_logs.map((log) => {
                                        const formatValue = (key: string, value: any) => {
                                            if (value === null || value === undefined) {
                                                return <span className="text-muted-foreground italic">brak</span>;
                                            }

                                            if (key === 'is_completed') {
                                                return value ? <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] py-0 h-4">Uzupełniono</Badge> : <Badge variant="outline" className="text-[10px] py-0 h-4">W trakcie</Badge>;
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

                                            if (typeof value === 'boolean') {
                                                return value ? 'Tak' : 'Nie';
                                            }

                                            return typeof value === 'object' ? JSON.stringify(value) : String(value);
                                        };

                                        const renderValueChange = (key: string, oldVal: any, newVal: any, log: AuditLog) => {
                                            if (log.auditable_type === 'App\\Models\\Checklist' && key === 'content') {
                                                const oldContent = Array.isArray(oldVal) ? oldVal : [];
                                                const newContent = Array.isArray(newVal) ? newVal : [];

                                                const changes = newContent.filter((newItem: any) => {
                                                    const oldItem = oldContent.find((i: any) => i.id === newItem.id);

                                                    return !oldItem || JSON.stringify(oldItem.value) !== JSON.stringify(newItem.value);
                                                });

                                                const isCompletedChanged = Object.prototype.hasOwnProperty.call(log.new_values, 'is_completed') &&
                                                                           log.old_values?.is_completed !== log.new_values.is_completed;

                                                if (changes.length === 0 && !isCompletedChanged) {
                                                    return null;
                                                }

                                                return (
                                                    <div className="flex flex-col gap-1 w-full">
                                                        {isCompletedChanged && (
                                                            <div className="flex items-center gap-1.5 flex-wrap bg-muted/20 p-1 rounded">
                                                                <span className="font-medium text-foreground">Status wymagań:</span>
                                                                <span className="text-muted-foreground line-through opacity-70">
                                                                    {log.old_values?.is_completed ? 'Skompletowano' : 'W trakcie'}
                                                                </span>
                                                                <LucideArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                                <span className="font-medium text-foreground">
                                                                    {log.new_values.is_completed ? 'Skompletowano' : 'W trakcie'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {changes.map((item: any) => {
                                                            const oldItem = oldContent.find((i: any) => i.id === item.id);

                                                            return (
                                                                <div key={item.id} className="flex items-center gap-1.5 flex-wrap bg-muted/20 p-1 rounded">
                                                                    <span className="font-medium text-foreground">{item.label}:</span>
                                                                    <span className="text-muted-foreground line-through opacity-70">
                                                                        {formatValue('value', oldItem?.value)}
                                                                    </span>
                                                                    <LucideArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                                    <span className="font-medium text-foreground">
                                                                        {formatValue('value', item.value)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-muted-foreground line-through opacity-70">
                                                        {formatValue(key, oldVal)}
                                                    </span>
                                                    <LucideArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                    <span className="font-medium text-foreground">
                                                        {formatValue(key, newVal)}
                                                    </span>
                                                </div>
                                            );
                                        };

                                        const getFieldLabel = (key: string, auditableType?: string) => {
                                            if (auditableType === 'App\\Models\\Checklist') {
                                                if (key === 'is_completed') {
                                                    return 'Status wymagań';
                                                }

                                                return 'Element checklisty';
                                            }

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

                                        const hasVisibleChanges = (log: AuditLog) => {
                                            if (log.event !== 'updated' || !log.new_values) {
                                                return true;
                                            }

                                            return Object.keys(log.new_values).some(key => {
                                                const content = renderValueChange(key, log.old_values?.[key], log.new_values[key], log);

                                                return content !== null;
                                            });
                                        };

                                        if (!hasVisibleChanges(log)) {
                                            return null;
                                        }

                                        return (
                                            <div key={log.id} className="text-sm border-l-2 border-muted pl-4 py-2 relative group hover:bg-muted/30 transition-colors rounded-r-md">
                                                <div className="absolute -left-[9px] top-3 h-4 w-4 rounded-full border-2 border-background bg-muted group-hover:bg-primary/30 transition-colors" />
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                        {log.auditable_type === 'App\\Models\\Checklist' ? (
                                                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                                                <LucideCheckCircle2 className="h-3 w-3" /> Checklista
                                                            </span>
                                                        ) : log.event === 'created' ? (
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
                                                        {Object.keys(log.new_values).map((key) => {
                                                            const changeContent = renderValueChange(key, log.old_values?.[key], log.new_values[key], log);

                                                            if (changeContent === null || (log.auditable_type === 'App\\Models\\Checklist' && key === 'is_completed')) {
                                                                return null;
                                                            }

                                                            const isChecklistContent = log.auditable_type === 'App\\Models\\Checklist' && key === 'content';
                                                            let changesCountBadge = null;

                                                            if (isChecklistContent) {
                                                                const checklistLogsCount = job.audit_logs.filter(l => l.auditable_type === 'App\\Models\\Checklist').length;

                                                                if (checklistLogsCount > 0) {
                                                                    changesCountBadge = (
                                                                        <Badge variant="secondary" className="text-[10px] py-0 h-5 font-normal">
                                                                            Checklista: {checklistLogsCount}
                                                                        </Badge>
                                                                    );
                                                                }
                                                            }

                                                            return (
                                                                <div key={key} className={`text-[11px] flex flex-col gap-1 items-start ${isChecklistContent ? 'mb-1' : 'sm:grid sm:grid-cols-[100px_1fr] sm:gap-2 sm:items-baseline'}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-medium text-muted-foreground ${isChecklistContent ? 'text-[10px] uppercase tracking-wider' : 'truncate w-full'}`} title={getFieldLabel(key, log.auditable_type)}>
                                                                            {getFieldLabel(key, log.auditable_type)}:
                                                                        </span>
                                                                        {changesCountBadge}
                                                                    </div>
                                                                    <div className="w-full">
                                                                        {changeContent}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
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
                    )}
                </Card>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Checklist Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <LucideCheckCircle2 className="h-5 w-5 text-primary" />
                                        Checklista
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {requiredFields.length > 0 && (
                                            <Badge variant={isFullyCompleted ? "default" : "secondary"} className="text-[10px] py-0 h-5">
                                                {isFullyCompleted ? "Skompletowano" : `Wypełniono ${completedRequired.length} z ${requiredFields.length}`}
                                            </Badge>
                                        )}
                                        {hasUnsavedChanges && (
                                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium animate-pulse">
                                                <LucideRefreshCcw className="h-3 w-3" />
                                                Niezapisane zmiany
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant={hasUnsavedChanges ? "default" : "outline"}
                                    onClick={saveChecklist}
                                    disabled={processing || !job.started_at}
                                    className={`h-8 px-2 sm:px-3 cursor-pointer transition-all duration-300 ${hasUnsavedChanges ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                >
                                    {processing ? (
                                        <LucideLoader2 className="mr-1 sm:mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <LucideSave className={`mr-1 sm:mr-2 h-4 w-4 ${hasUnsavedChanges ? 'animate-bounce' : ''}`} />
                                    )}
                                    <span className="text-xs sm:text-sm">Zapisz</span>
                                    {hasUnsavedChanges && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                    </span>}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6 relative pt-4">
                                {requiredFields.length > 0 && (
                                    <div className="px-1 sm:px-0">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Postęp wymagań</span>
                                            <span className="text-[10px] font-bold text-primary">{Math.round((completedRequired.length / requiredFields.length) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500 ease-out"
                                                style={{ width: `${(completedRequired.length / requiredFields.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
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
                                    <div key={item.id} className="flex flex-col gap-2 p-2 sm:p-0 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start gap-3">
                                            {item.type === 'checkbox' ? (
                                                <div className="w-full">
                                                    <div
                                                        className={`flex items-center gap-3 py-3 sm:py-2 transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => job.started_at && updateChecklist(index, !item.value)}
                                                    >
                                                        <Checkbox
                                                            id={item.id}
                                                            checked={!!item.value}
                                                            onCheckedChange={(checked) => job.started_at && updateChecklist(index, !!checked)}
                                                            aria-invalid={!!(errors as any)[`checklist_content.${index}.value`]}
                                                            className={`h-5 w-5 sm:h-4 sm:w-4 transition-transform ${item.value ? 'scale-110' : 'scale-100'}`}
                                                            disabled={!job.started_at}
                                                        />
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <Label
                                                                htmlFor={item.id}
                                                                className={`text-sm sm:text-base font-medium leading-none ${!job.started_at ? 'cursor-not-allowed' : 'cursor-pointer'} ${item.value ? 'text-muted-foreground line-through decoration-primary/30' : ''}`}
                                                            >
                                                                {item.label}
                                                                {item.required && <span className="text-red-500 ml-1">*</span>}
                                                            </Label>
                                                            {!!item.value && <LucideCheck className="h-4 w-4 text-primary animate-in zoom-in duration-300" />}
                                                        </div>
                                                    </div>
                                                    { (errors as any)[`checklist_content.${index}.value`] && (
                                                        <p className="text-xs text-destructive mt-1.5 ml-11 font-medium">
                                                            { (errors as any)[`checklist_content.${index}.value`]}
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
                                                            className={`${item.type === 'text' ? 'pr-12' : ''}`}
                                                            aria-invalid={!!(errors as any)[`checklist_content.${index}.value`]}
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
                                                            />
                                                        )}
                                                    </div>
                                                    { (errors as any)[`checklist_content.${index}.value`] && (
                                                        <p className="text-xs text-destructive font-medium">
                                                            { (errors as any)[`checklist_content.${index}.value`]}
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
                                        {job.template.require_photo_before && <span className="text-red-500 font-bold">*</span>}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Label htmlFor="capture-before" className={`flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <LucideCamera className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Aparat</span>
                                            <input id="capture-before" type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => job.started_at && handleFileUpload(e, 'images_before')} disabled={!job.started_at} />
                                        </Label>
                                        <Label htmlFor="upload-before" className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <LucidePlus className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Galeria</span>
                                            <input id="upload-before" type="file" className="hidden" accept="image/*" onChange={(e) => job.started_at && handleFileUpload(e, 'images_before')} disabled={!job.started_at} />
                                        </Label>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 relative">
                                    {!job.started_at && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-lg">
                                            <div className="bg-card border shadow-sm p-2 rounded-lg text-center max-w-[150px] mx-auto">
                                                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    Rozpocznij zlecenie, aby dodać zdjęcia.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-3 p-2 rounded-lg border-2 border-dashed transition-colors ${ (errors as any)['media.images_before'] ? 'border-destructive bg-destructive/5' : dragOver === 'images_before' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                        onDragOver={(e) => job.started_at && onDragOver(e, 'images_before')}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => job.started_at && onDrop(e, 'images_before')}
                                    >
                                        {job.media.images_before.map((m, idx) => (
                                            <div
                                                key={m.id}
                                                draggable
                                                onDragStart={(e) => onMediaDragStart(e, m.id, 'images_before')}
                                                onDragEnd={onMediaDragEnd}
                                                onDragOver={(e) => onMediaDragOver(e, m.id, 'images_before')}
                                                onDrop={(e) => onMediaDrop(e, m.id, 'images_before')}
                                                className={`flex flex-col gap-1 transition-all duration-200 ${dragOverItem === m.id ? 'scale-105 z-10' : ''}`}
                                            >
                                                <div
                                                    onClick={() => setPreviewImage(m.original_url)}
                                                    className={`relative aspect-square rounded-t-md overflow-hidden border bg-muted shadow-sm cursor-pointer group/photo ${dragOverItem === m.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                                >
                                                    <img src={m.url} alt="Przed" className="h-full w-full object-cover pointer-events-none" />

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                                                            <LucideSearch className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-1 bg-background border border-t-0 rounded-b-md shadow-sm">
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewImage(m.original_url);
                                                            }}
                                                        >
                                                            <LucideSearch className="h-4 w-4" />
                                                        </Button>

                                                        {idx > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveMedia(m.id, 'up', 'images_before');
                                                                }}
                                                            >
                                                                <LucideArrowUp className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {idx < job.media.images_before.length - 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveMedia(m.id, 'down', 'images_before');
                                                                }}
                                                            >
                                                                <LucideArrowDown className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMediaToDelete(m.id);
                                                        }}
                                                    >
                                                        <LucideTrash2 className="h-4 w-4" />
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
                                            <input id="upload-before-grid" type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'images_before')} disabled={!!uploadingCollection} />
                                        </label>
                                    </div>
                                    { (errors as any)['media.images_before'] && (
                                        <p className="text-xs text-destructive mt-2 font-medium">{ (errors as any)['media.images_before']}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-1">
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LucideCamera className="h-4 w-4" />
                                        Zdjęcia PO
                                        {job.template.require_photo_after && <span className="text-red-500 font-bold">*</span>}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Label htmlFor="capture-after" className={`flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <LucideCamera className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Aparat</span>
                                            <input id="capture-after" type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => job.started_at && handleFileUpload(e, 'images_after')} disabled={!job.started_at} />
                                        </Label>
                                        <Label htmlFor="upload-after" className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors ${!job.started_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <LucidePlus className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Galeria</span>
                                            <input id="upload-after" type="file" className="hidden" accept="image/*" onChange={(e) => job.started_at && handleFileUpload(e, 'images_after')} disabled={!job.started_at} />
                                        </Label>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 relative">
                                    {!job.started_at && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-lg">
                                            <div className="bg-card border shadow-sm p-2 rounded-lg text-center max-w-[150px] mx-auto">
                                                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    Rozpocznij zlecenie, aby dodać zdjęcia.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-3 p-2 rounded-lg border-2 border-dashed transition-colors ${ (errors as any)['media.images_after'] ? 'border-destructive bg-destructive/5' : dragOver === 'images_after' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                        onDragOver={(e) => job.started_at && onDragOver(e, 'images_after')}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => job.started_at && onDrop(e, 'images_after')}
                                    >
                                        {job.media.images_after.map((m, idx) => (
                                            <div
                                                key={m.id}
                                                draggable
                                                onDragStart={(e) => onMediaDragStart(e, m.id, 'images_after')}
                                                onDragEnd={onMediaDragEnd}
                                                onDragOver={(e) => onMediaDragOver(e, m.id, 'images_after')}
                                                onDrop={(e) => onMediaDrop(e, m.id, 'images_after')}
                                                className={`flex flex-col gap-1 transition-all duration-200 ${dragOverItem === m.id ? 'scale-105 z-10' : ''}`}
                                            >
                                                <div
                                                    onClick={() => setPreviewImage(m.original_url)}
                                                    className={`relative aspect-square rounded-t-md overflow-hidden border bg-muted shadow-sm cursor-pointer group/photo ${dragOverItem === m.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                                >
                                                    <img src={m.url} alt="Po" className="h-full w-full object-cover pointer-events-none" />

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                                                            <LucideSearch className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-1 bg-background border border-t-0 rounded-b-md shadow-sm">
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewImage(m.original_url);
                                                            }}
                                                        >
                                                            <LucideSearch className="h-4 w-4" />
                                                        </Button>

                                                        {idx > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveMedia(m.id, 'up', 'images_after');
                                                                }}
                                                            >
                                                                <LucideArrowUp className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {idx < job.media.images_after.length - 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    moveMedia(m.id, 'down', 'images_after');
                                                                }}
                                                            >
                                                                <LucideArrowDown className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMediaToDelete(m.id);
                                                        }}
                                                    >
                                                        <LucideTrash2 className="h-4 w-4" />
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
                                            <input id="upload-after-grid" type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'images_after')} disabled={!!uploadingCollection} />
                                        </label>
                                    </div>
                                    { (errors as any)['media.images_after'] && (
                                        <p className="text-xs text-destructive mt-2 font-medium">{ (errors as any)['media.images_after']}</p>
                                    )}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LucideFileText className="h-4 w-4" />
                                        Podpis klienta
                                        {job.template.require_signature && <span className="text-red-500 font-bold">*</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 relative">
                                    {!job.started_at && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-b-lg">
                                            <div className="bg-card border shadow-sm p-2 rounded-lg text-center max-w-[150px] mx-auto">
                                                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                                <p className="text-[10px] font-medium text-muted-foreground">
                                                    Rozpocznij zlecenie, aby zebrać podpis.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {job.media.signature ? (
                                        <div className="border rounded-md p-2 bg-white">
                                            <img src={job.media.signature} alt="Podpis" className="h-20 w-full object-contain" />
                                            <p className="text-[10px] text-center text-muted-foreground mt-1">Podpisano</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Dialog open={isSignatureOpen} onOpenChange={(open) => job.started_at && is_ready_for_signature && setIsSignatureOpen(open)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="secondary" disabled={!job.started_at || !is_ready_for_signature} className={`w-full h-24 border-2 border-dashed flex-col ${!job.started_at || !is_ready_for_signature ? 'cursor-not-allowed' : 'cursor-pointer'} ${ (errors as any)['media.signature'] ? 'border-destructive bg-destructive/5 text-destructive' : ''}`}>
                                                        <LucidePencil className="h-6 w-6 mb-1" />
                                                        Zbierz podpis na miejscu
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
                                                    <DialogHeader>
                                                        <DialogTitle>Podpis klienta</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="bg-white border rounded-lg overflow-hidden">
                                                        <canvas ref={signatureRef} className="w-full h-80 touch-none cursor-crosshair" />
                                                    </div>

                                                    <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 space-y-3 mt-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex items-center h-5">
                                                                <input
                                                                    id="declaration-checkbox"
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                                    checked={isDeclarationAccepted}
                                                                    onChange={(e) => setIsDeclarationAccepted(e.target.checked)}
                                                                />
                                                            </div>
                                                            <label htmlFor="declaration-checkbox" className="text-xs font-semibold text-foreground cursor-pointer select-none leading-normal">
                                                                Podpisując niniejszy raport, oświadczam, że prace zostały wykonane zgodnie ze zleceniem, w pełnym zakresie i bez zastrzeżeń. Niniejszym dokonuję odbioru prac i potwierdzam ich zgodność ze stanem faktycznym.
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between gap-2 mt-4">
                                                        <Button variant="outline" onClick={() => signaturePadRef.current?.clear()} className="cursor-pointer" disabled={isSignatureSaving}>Wyczyść</Button>
                                                        <Button
                                                            onClick={handleSaveSignature}
                                                            className="cursor-pointer"
                                                            disabled={!isDeclarationAccepted || isSignatureSaving}
                                                        >
                                                            {isSignatureSaving ? (
                                                                <>
                                                                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Zapisywanie...
                                                                </>
                                                            ) : 'Zapisz podpis'}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="outline"
                                                className={`w-full text-xs ${!is_ready_for_signature ? 'opacity-50' : ''}`}
                                                onClick={handleRequestSignature}
                                                disabled={!job.started_at || processing || !is_ready_for_signature}
                                            >
                                                <LucideMail className="mr-2 h-3.5 w-3.5" />
                                                Poproś o podpis zdalny
                                            </Button>
                                            {!is_ready_for_signature && job.started_at && (
                                                <p className="text-[10px] text-muted-foreground text-center px-2">
                                                    Uzupełnij checklistę i wymagane zdjęcia, aby móc zebrać podpis.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    { (errors as any)['media.signature'] && (
                                        <p className="text-xs text-destructive mt-2 font-medium">{ (errors as any)['media.signature']}</p>
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

                                    <div className="pt-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full text-xs h-8 cursor-pointer"
                                            onClick={handleCopyPublicLink}
                                        >
                                            {copied ? (
                                                <>
                                                    <LucideCheck className="mr-2 h-3 w-3 text-green-500" />
                                                    Skopiowano link!
                                                </>
                                            ) : (
                                                <>
                                                    <LucideCopy className="mr-2 h-3 w-3" />
                                                    Kopiuj link dla klienta
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <p className="text-sm flex-1">{job.client?.address}</p>
                                        {job.client?.address && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                title="Otwórz w Google Maps"
                                                asChild
                                            >
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.client.address)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LucideExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {job.client?.latitude && job.client?.longitude && (
                                    <div className="mt-2 relative z-0">
                                        <JobMap
                                            jobs={[{
                                                id: job.id,
                                                status: job.status,
                                                status_label: statusLabels[job.status] || job.status,
                                                client_name: job.client.name,
                                                address: job.client.address || '',
                                                latitude: job.client.latitude,
                                                longitude: job.client.longitude
                                            }]}
                                            height="150px"
                                            zoom={14}
                                            center={[job.client.latitude, job.client.longitude]}
                                        />
                                    </div>
                                )}
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

                        <div className="space-y-2">
                            <div className="space-y-1">
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                                    onClick={() => setIsFinishDialogOpen(true)}
                                    disabled={job.status === 'completed' || job.status === 'approved' || !canFinish}
                                >
                                    <LucideCheck className="mr-2 h-4 w-4" />
                                    Zakończ zlecenie
                                </Button>
                                {!canFinish && (
                                    <p className="text-[10px] text-muted-foreground font-semibold text-center">
                                        Musisz najpierw rozpocząć pracę, aby móc ją zakończyć.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Button variant="outline" className="w-full cursor-pointer" asChild={canViewReport} disabled={!canViewReport}>
                                    {canViewReport ? (
                                        <a href={reportRoute(job.id).url} target="_blank" rel="noreferrer">
                                            <LucideFileText className="mr-2 h-4 w-4" />
                                            Podgląd raportu PDF
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <LucideFileText className="mr-2 h-4 w-4" />
                                            Podgląd raportu PDF
                                        </div>
                                    )}
                                </Button>
                                {!canViewReport && (
                                    <p className="text-[10px] text-muted-foreground font-medium text-center">
                                        Raport dostępny po zakończeniu zlecenia i wypełnieniu wszystkich wymaganych pól checklisty.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Button variant="secondary" className="w-full cursor-pointer" onClick={handleSendReport} disabled={!canViewReport}>
                                    <LucideMail className="mr-2 h-4 w-4" />
                                    Wyślij do klienta
                                </Button>
                                {!canViewReport && (
                                    <p className="text-[10px] text-muted-foreground font-medium text-center">
                                        Wysyłka możliwa po zakończeniu zlecenia i wypełnieniu checklisty.
                                    </p>
                                )}
                            </div>
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
