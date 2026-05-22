import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LucidePencil, LucidePlus, LucideTrash2, LucideUser, LucideUpload, LucideDownload } from 'lucide-react';
import { useState, useRef } from 'react';

import { create, destroy, edit, index, importMethod as importAction, downloadTemplate } from '@/actions/App/Http/Controllers/ClientController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedClients {
    data: Client[];
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    clients: PaginatedClients;
}

export default function Index({ clients }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isOwnerOrManager = user.role === 'owner' || user.role === 'manager';

    const { delete: destroyClient, post: postImport, processing: importing, setData } = useForm({
        file: null as File | null,
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('file', file);
            postImport(importAction.url(), {
                onSuccess: () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setClientToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (clientToDelete) {
            destroyClient(destroy.url(clientToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setClientToDelete(null);
                },
            });
        }
    };

    return (
        <>
            <Head title="Klienci" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Klienci</h1>
                    {isOwnerOrManager && (
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={handleImportClick}
                                disabled={importing}
                                className="cursor-pointer"
                            >
                                <LucideUpload className="mr-2 h-4 w-4" />
                                {importing ? 'Importowanie...' : 'Importuj CSV'}
                            </Button>
                            <Button variant="outline" asChild className="cursor-pointer">
                                <a href={downloadTemplate.url()}>
                                    <LucideDownload className="mr-2 h-4 w-4" />
                                    Pobierz wzór
                                </a>
                            </Button>
                            <Button asChild className="cursor-pointer">
                                <Link href={create.url()}>
                                    <LucidePlus className="mr-2 h-4 w-4" />
                                    Dodaj klienta
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.data.map((client) => (
                        <Card key={client.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <LucideUser className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <CardTitle className="truncate text-lg">{client.name}</CardTitle>
                                    {client.email && (
                                        <p className="truncate text-sm text-muted-foreground">{client.email}</p>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-2 space-y-1 text-sm">
                                    {client.phone && <p>Tel: {client.phone}</p>}
                                    {client.address && <p className="truncate">Adres: {client.address}</p>}
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    {isOwnerOrManager && (
                                        <>
                                            <Button variant="outline" size="sm" asChild className="cursor-pointer">
                                                <Link href={edit.url(client.id)}>
                                                    <LucidePencil className="mr-2 h-4 w-4" />
                                                    Edytuj
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteClick(client.id)}
                                                className="cursor-pointer"
                                            >
                                                <LucideTrash2 className="mr-2 h-4 w-4" />
                                                Usuń
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {clients.data.length === 0 && (
                        <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            <p>Brak klientów w bazie.</p>
                            {isOwnerOrManager && (
                                <Button variant="link" asChild className="cursor-pointer">
                                    <Link href={create.url()}>Dodaj pierwszego klienta</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {clients.total > 0 && clients.last_page > 1 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-1">
                        {clients.links.map((link, i) => {
                            if (link.url === null) {
                                return (
                                    <span
                                        key={i}
                                        className="rounded-md border px-3 py-1 text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted ${
                                        link.active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Usuń klienta</DialogTitle>
                        <DialogDescription>
                            Czy na pewno chcesz usunąć tego klienta? Tej operacji nie można cofnąć.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="cursor-pointer">
                            Anuluj
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="cursor-pointer">
                            Usuń
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Klienci',
            href: index.url(),
        },
    ],
};
