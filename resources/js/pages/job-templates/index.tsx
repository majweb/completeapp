import { Head, Link, useForm } from '@inertiajs/react';
import { LucidePlus, LucideTrash2, LucideEdit } from 'lucide-react';
import React, { useState } from 'react';
import { index, create, edit, destroy } from '@/actions/App/Http/Controllers/JobTemplateController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface Template {
    id: number;
    name: string;
    description: string;
    version: string;
    structure: any[];
}

export default function Index({ templates }: { templates: Template[] }) {
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    const { delete: destroyTemplate, processing } = useForm();

    const confirmDelete = () => {
        if (templateToDelete) {
            destroyTemplate(destroy.url(templateToDelete), {
                onSuccess: () => setTemplateToDelete(null),
                onFinish: () => setTemplateToDelete(null),
            });
        }
    };

    return (
        <>
            <Head title="Szablony zleceń" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Szablony zleceń</h1>
                    <Button asChild className="cursor-pointer">
                        <Link href={create.url()}>
                            <LucidePlus className="mr-2 h-4 w-4" />
                            Dodaj szablon
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dostępne szablony</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nazwa</th>
                                        <th className="px-4 py-3 text-left">Opis</th>
                                        <th className="px-4 py-3 text-left">Wersja</th>
                                        <th className="px-4 py-3 text-left">Pola</th>
                                        <th className="px-4 py-3 text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {templates.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted-foreground py-8">
                                                Brak zdefiniowanych szablonów.
                                            </td>
                                        </tr>
                                    ) : (
                                        templates.map((template) => (
                                            <tr key={template.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">{template.name}</td>
                                                <td className="px-4 py-3 max-w-xs truncate">{template.description}</td>
                                                <td className="px-4 py-3">{template.version}</td>
                                                <td className="px-4 py-3">{template.structure.length} pól</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" asChild className="cursor-pointer">
                                                            <Link href={edit.url(template.id)}>
                                                                <LucideEdit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="text-destructive cursor-pointer" onClick={() => setTemplateToDelete(template.id)}>
                                                            <LucideTrash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Czy na pewno chcesz usunąć ten szablon?</DialogTitle>
                            <DialogDescription>
                                Ta operacja jest nieodwracalna. Szablon zostanie trwale usunięty z systemu.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Anuluj</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
                                Usuń szablon
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Szablony', href: index.url() },
    ],
};
