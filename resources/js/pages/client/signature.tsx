import { Head, useForm } from '@inertiajs/react';
import { LucideCheckCircle2, LucideCamera, LucideSave, LucideInfo, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    status: string;
    completed_at: string | null;
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
    company?: {
        name: string;
        logo_url?: string;
    };
    checklist?: {
        content: ChecklistItem[];
    } | null;
}

interface Props {
    job: Job;
    media: {
        before: MediaItem[];
        after: MediaItem[];
    };
}

export default function Signature({ job, media }: Props) {
    const signaturePadRef = useRef<HTMLCanvasElement>(null);
    const signaturePad = useRef<SignaturePad | null>(null);
    const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
    const [isChecklistOpen, setIsChecklistOpen] = useState(true);
    const [isBeforePhotosOpen, setIsBeforePhotosOpen] = useState(true);
    const [isAfterPhotosOpen, setIsAfterPhotosOpen] = useState(true);
    const [isDeclarationAccepted, setIsDeclarationAccepted] = useState(false);

    const { data, setData, post, processing } = useForm({
        signature: '',
    });

    useEffect(() => {
        if (signaturePadRef.current) {
            signaturePad.current = new SignaturePad(signaturePadRef.current, {
                backgroundColor: 'rgb(255, 255, 255)',
            });

            signaturePad.current.addEventListener('endStroke', () => {
                setIsSignatureEmpty(signaturePad.current?.isEmpty() ?? true);
            });

            const resizeCanvas = () => {
                const canvas = signaturePadRef.current;

                if (canvas) {
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);

                    canvas.width = canvas.offsetWidth * ratio;
                    canvas.height = canvas.offsetHeight * ratio;
                    canvas.getContext('2d')?.scale(ratio, ratio);
                    signaturePad.current?.clear();
                }
            };

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            return () => window.removeEventListener('resize', resizeCanvas);
        }
    }, []);

    const handleClear = () => {
        signaturePad.current?.clear();
        setIsSignatureEmpty(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (signaturePad.current && !signaturePad.current.isEmpty()) {
            const signatureData = signaturePad.current.toDataURL();

            setData('signature', signatureData);

            // Re-post with the data
            const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
            post(currentUrl, {
                onBefore: () => {
                    // Manual data assignment because useForm's setData is async
                    data.signature = signatureData;
                },
                preserveScroll: true
            });
        }
    };

    if (job.status === 'completed' || job.status === 'approved') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-10 pb-10">
                        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LucideCheckCircle2 size={32} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Zlecenie zakończone</h1>
                        <p className="text-slate-500 mb-6">Podpis został już złożony i zlecenie zostało pomyślnie zamknięte. Dziękujemy!</p>
                        <Badge variant="outline" className="text-sm">Status: Zakończone</Badge>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-3 md:p-8">
            <Head title={`Podpis klienta - Zlecenie #${job.id}`} />

            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                <header className="text-center mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2 leading-tight">Potwierdzenie wykonania usługi</h1>
                    <p className="text-sm md:text-base text-slate-500">Zlecenie #{job.id} dla {job.client.name}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Szczegóły zlecenia */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader className="py-4 md:py-6">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <LucideInfo className="text-blue-500" size={18} />
                                Informacje
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4 text-sm py-4 md:py-6">
                            {job.company && (
                                <>
                                    <div className="flex flex-col items-center justify-center pb-2">
                                        {job.company.logo_url && (
                                            <div className="mb-3 max-h-16 flex items-center justify-center">
                                                <img src={job.company.logo_url} alt={job.company.name} className="max-h-16 w-auto object-contain" />
                                            </div>
                                        )}
                                        <p className="text-slate-400 font-medium uppercase text-xs">Firma</p>
                                        <p className="font-bold text-base">{job.company.name}</p>
                                    </div>
                                    <Separator />
                                </>
                            )}
                            <div>
                                <p className="text-slate-400 font-medium uppercase text-xs">Technik</p>
                                <p className="font-semibold">{job.technician.name}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-slate-400 font-medium uppercase text-xs">Usługa</p>
                                <p className="font-semibold">{job.template?.name || 'Standardowa usługa'}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-slate-400 font-medium uppercase text-xs">Adres</p>
                                <p className="font-semibold">{job.client.address || 'Brak adresu'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 space-y-4 md:space-y-6">
                        {job.checklist && job.checklist.content.length > 0 && (
                            <Card>
                                <Collapsible open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 md:py-6">
                                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                            <LucideCheckCircle2 className="text-green-500" size={18} />
                                            Podsumowanie prac
                                        </CardTitle>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                                {isChecklistOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                <span className="sr-only">Toggle</span>
                                            </Button>
                                        </CollapsibleTrigger>
                                    </CardHeader>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 pb-4 md:pb-6">
                                            <div className="space-y-1 md:space-y-3">
                                                {job.checklist.content.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start gap-4 py-2 border-b last:border-0 border-slate-100">
                                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                        <div className="text-sm text-slate-500 shrink-0">
                                                            {item.type === 'checkbox' ? (
                                                                item.value ? (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-0 px-2 h-5 text-[10px] md:text-xs">TAK</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-slate-400 py-0 px-2 h-5 text-[10px] md:text-xs">NIE</Badge>
                                                                )
                                                            ) : (
                                                                <span className="font-semibold text-slate-900">{item.value || '-'}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        )}

                        {(media.before.length > 0 || media.after.length > 0) && (
                            <div className="space-y-4 md:space-y-6">
                                {media.before.length > 0 && (
                                    <Card>
                                        <Collapsible open={isBeforePhotosOpen} onOpenChange={setIsBeforePhotosOpen}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 md:py-6">
                                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                    <LucideCamera className="text-slate-500" size={18} />
                                                    Dokumentacja przed pracami
                                                </CardTitle>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                                        {isBeforePhotosOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        <span className="sr-only">Toggle</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </CardHeader>
                                            <CollapsibleContent>
                                                <CardContent className="pb-4 md:pb-6">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                                                        {media.before.map((item) => (
                                                            <Dialog key={item.id}>
                                                                <DialogTrigger asChild>
                                                                    <div className="aspect-square rounded-md overflow-hidden border cursor-zoom-in hover:opacity-90 transition-opacity">
                                                                        <img src={item.url} alt="Zdjęcie przed" className="w-full h-full object-cover" />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none [&>button]:text-white [&>button]:cursor-pointer">
                                                                    <div className="flex items-center justify-center min-h-[50vh]">
                                                                        <img src={item.url} alt="Zdjęcie przed" className="max-w-full max-h-[85vh] object-contain" />
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                )}

                                {media.after.length > 0 && (
                                    <Card>
                                        <Collapsible open={isAfterPhotosOpen} onOpenChange={setIsAfterPhotosOpen}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 md:py-6">
                                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                    <LucideCamera className="text-blue-500" size={18} />
                                                    Dokumentacja po wykonaniu prac
                                                </CardTitle>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                                        {isAfterPhotosOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        <span className="sr-only">Toggle</span>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </CardHeader>
                                            <CollapsibleContent>
                                                <CardContent className="pb-4 md:pb-6">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                                                        {media.after.map((item) => (
                                                            <Dialog key={item.id}>
                                                                <DialogTrigger asChild>
                                                                    <div className="aspect-square rounded-md overflow-hidden border cursor-zoom-in hover:opacity-90 transition-opacity">
                                                                        <img src={item.url} alt="Zdjęcie po" className="w-full h-full object-cover" />
                                                                    </div>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none [&>button]:text-white [&>button]:cursor-pointer">
                                                                    <div className="flex items-center justify-center min-h-[50vh]">
                                                                        <img src={item.url} alt="Zdjęcie po" className="max-w-full max-h-[85vh] object-contain" />
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                )}
                            </div>
                        )}
                        <Card className="border-blue-200 ring-1 ring-blue-100">
                            <CardHeader className="py-4 md:py-6">
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <LucideSave className="text-blue-600" size={18} />
                                    Podpis klienta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pb-4 md:pb-6">
                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="declaration-checkbox"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isDeclarationAccepted}
                                                onChange={(e) => setIsDeclarationAccepted(e.target.checked)}
                                            />
                                        </div>
                                        <label htmlFor="declaration-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none leading-normal">
                                            Podpisując niniejszy raport, oświadczam, że prace zostały wykonane zgodnie ze zleceniem, w pełnym zakresie i bez zastrzeżeń. Niniejszym dokonuję odbioru prac i potwierdzam ich zgodność ze stanem faktycznym.
                                        </label>
                                    </div>
                                </div>

                                <div className="border rounded-lg bg-white overflow-hidden shadow-inner">
                                    <canvas
                                        ref={signaturePadRef}
                                        className="w-full h-40 md:h-48 touch-none cursor-crosshair"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleClear}
                                        disabled={isSignatureEmpty || processing}
                                        className="w-full sm:w-auto h-11 md:h-10 cursor-pointer"
                                    >
                                        Wyczyść
                                    </Button>

                                    <Button
                                        className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 h-11 md:h-10 text-base md:text-sm cursor-pointer"
                                        onClick={handleSubmit}
                                        disabled={isSignatureEmpty || processing || !isDeclarationAccepted}
                                    >
                                        {processing ? (
                                            <>
                                                <LucideSave className="mr-2 h-4 w-4 animate-spin" />
                                                Zapisywanie...
                                            </>
                                        ) : 'Złóż podpis i zakończ'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <footer className="text-center pt-8 text-slate-400 text-xs">
                    Zasilane przez {job.company?.name || 'System Serwisowy'}
                </footer>
            </div>
        </div>
    );
}
