import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { LucideArrowLeft, LucideCalendar, LucideUser, LucideCheckCircle2, LucideCamera, LucideFileText, LucidePlus, LucideSave, LucideCheck, LucidePencil, LucideTrash2, LucideMail, LucideUpload, LucideLoader2, LucideArrowUp, LucideArrowDown } from 'lucide-react';
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
import { index as indexRoute, edit as editRoute, report as reportRoute } from '@/routes/jobs';

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
}

interface Props {
    job: Job;
}

const statusLabels: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    approved: 'Zatwierdzone',
};

export default function Show({ job }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isOwnerOrManager = user.role === 'owner' || user.role === 'manager';

    const { data, setData, put, processing, errors } = useForm<{
        checklist_content: ChecklistItem[];
        status: string;
    }>({
        checklist_content: job.checklist?.content || [],
        status: job.status,
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

    const updateChecklist = (index: number, value: any) => {
        const newContent = [...data.checklist_content];
        newContent[index].value = value;
        setData('checklist_content', newContent);
    };

    const finishJob = () => {
        router.put(update(job.id).url, {
            checklist_content: data.checklist_content,
            status: 'completed'
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
                            <Badge variant="outline" className="text-sm px-3 py-1 uppercase tracking-wider">
                                {statusLabels[job.status] || job.status}
                            </Badge>
                        </div>
                    </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Checklist Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <LucideCheckCircle2 className="h-5 w-5 text-primary" />
                                    Checklista
                                </CardTitle>
                                <Button size="sm" variant="outline" onClick={saveChecklist} disabled={processing} className="cursor-pointer">
                                    <LucideSave className="mr-2 h-4 w-4" />
                                    Zapisz postęp
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {data.checklist_content.map((item, index) => (
                                    <div key={item.id} className="flex flex-col gap-2">
                                        <div className="flex items-start gap-3">
                                            {item.type === 'checkbox' ? (
                                                <div className="w-full">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            id={item.id}
                                                            checked={!!item.value}
                                                            onCheckedChange={(checked) => updateChecklist(index, !!checked)}
                                                            className={`cursor-pointer ${(errors as any)[`checklist_content.${index}.value`] ? 'border-destructive' : ''}`}
                                                        />
                                                        <Label htmlFor={item.id} className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                            {item.label}
                                                            {item.required && <span className="text-red-500 ml-1">*</span>}
                                                        </Label>
                                                    </div>
                                                    {(errors as any)[`checklist_content.${index}.value`] && (
                                                        <p className="text-xs text-destructive mt-1.5 ml-8 font-medium">
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
                                                            className={`${item.type === 'text' ? 'pr-10' : ''} ${(errors as any)[`checklist_content.${index}.value`] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                            value={item.value || ''}
                                                            onChange={(e) => updateChecklist(index, e.target.value)}
                                                            required={item.required}
                                                        />
                                                        {item.type === 'text' && (
                                                            <VoiceInput
                                                                onResult={(text) => {
                                                                    const val = item.value || '';
                                                                    updateChecklist(index, val + (val ? ' ' : '') + text);
                                                                }}
                                                                className="absolute right-1 top-1/2 -translate-y-1/2"
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
