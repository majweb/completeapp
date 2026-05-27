import { LucideCamera, LucideCheckSquare, LucideHash, LucidePenTool, LucideSmartphone, LucideType } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Field {
    id: string;
    label: string;
    type: 'checkbox' | 'text' | 'number';
    required: boolean;
}

interface JobTemplatePreviewProps {
    data: {
        name: string;
        description: string;
        version: string;
        structure: Field[];
        require_photo_before: boolean;
        require_photo_after: boolean;
        require_signature: boolean;
    };
}

export function JobTemplatePreview({ data }: JobTemplatePreviewProps) {
    return (
        <div className="sticky top-4 space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Podgląd pracownika</h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    Tryb mobilny
                </Badge>
            </div>

            <div className="relative mx-auto w-full max-w-[350px] overflow-hidden rounded-[3rem] border-8 border-slate-900 bg-slate-900 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 z-20 h-6 w-32 -translate-x-1/2 rounded-b-xl bg-slate-900"></div>

                {/* Screen Content */}
                <div className="h-[600px] overflow-y-auto bg-slate-50 p-4 pt-8 scrollbar-hide">
                    <div className="mb-6 space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {data.name || 'Nazwa zadania'}
                        </h3>
                        <p className="text-xs text-slate-500">Wersja {data.version}</p>
                        {data.description && (
                            <p className="mt-2 text-sm text-slate-600 line-clamp-2 italic">
                                "{data.description}"
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Photos Before */}
                        {data.require_photo_before && (
                            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
                                <LucideCamera className="mx-auto mb-2 h-6 w-6 text-primary" />
                                <p className="text-xs font-medium text-primary">Dodaj zdjęcie PRZED</p>
                            </div>
                        )}

                        {/* Checklist */}
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                {data.structure.map((field, idx) => (
                                    <div key={field.id || idx} className="space-y-2 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                        <div className="flex items-start gap-3">
                                            {field.type === 'checkbox' ? (
                                                <div className="mt-0.5 h-5 w-5 rounded border-2 border-slate-300 bg-white" />
                                            ) : (
                                                <div className="mt-1">
                                                    {field.type === 'text' ? <LucideType className="h-4 w-4 text-slate-400" /> : <LucideHash className="h-4 w-4 text-slate-400" />}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {field.label || `Pole ${idx + 1}`}
                                                    {field.required && <span className="ml-1 text-destructive font-bold">*</span>}
                                                </p>
                                                {field.type !== 'checkbox' && (
                                                    <div className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-slate-50/50" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Photos After */}
                        {data.require_photo_after && (
                            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
                                <LucideCamera className="mx-auto mb-2 h-6 w-6 text-primary" />
                                <p className="text-xs font-medium text-primary">Dodaj zdjęcie PO</p>
                            </div>
                        )}

                        {/* Signature */}
                        {data.require_signature && (
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <LucidePenTool className="h-4 w-4 text-slate-400" />
                                    <p className="text-xs font-medium text-slate-500">Podpis klienta</p>
                                </div>
                                <div className="h-20 w-full rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300 italic tracking-widest">MIEJSCE NA PODPIS</span>
                                </div>
                            </div>
                        )}

                        <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold shadow-lg" disabled>
                            Zakończ pracę
                        </Button>
                    </div>
                </div>

                {/* Home Bar */}
                <div className="absolute bottom-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-700/50"></div>
            </div>

            <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground italic justify-center">
                <LucideSmartphone className="h-3 w-3" />
                <span>To jest wizualizacja interfejsu aplikacji mobilnej dla technika.</span>
            </div>
        </div>
    );
}
