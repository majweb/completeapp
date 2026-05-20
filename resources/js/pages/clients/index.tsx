import { Head, Link, useForm } from '@inertiajs/react';
import { LucidePencil, LucidePlus, LucideTrash2, LucideUser } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}

interface Props {
    clients: Client[];
}

export default function Index({ clients }: Props) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
            destroy(route('clients.destroy', id));
        }
    };

    return (
        <>
            <Head title="Klienci" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Klienci</h1>
                    <Button asChild>
                        <Link href={route('clients.create')}>
                            <LucidePlus className="mr-2 h-4 w-4" />
                            Dodaj klienta
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
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
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route('clients.edit', client.id)}>
                                            <LucidePencil className="mr-2 h-4 w-4" />
                                            Edytuj
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}>
                                        <LucideTrash2 className="mr-2 h-4 w-4" />
                                        Usuń
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {clients.length === 0 && (
                        <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            <p>Brak klientów w bazie.</p>
                            <Button variant="link" asChild>
                                <Link href={route('clients.create')}>Dodaj pierwszego klienta</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
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
            href: '/clients',
        },
    ],
};
