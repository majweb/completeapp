import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucideSave } from 'lucide-react';

import { index, store } from '@/actions/App/Http/Controllers/ClientController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <>
            <Head title="Dodaj Klienta" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={index.url()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Dodaj nowego klienta</h1>
                </div>

                <div className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dane klienta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Imię i nazwisko / Nazwa firmy</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="np. Jan Kowalski"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="klient@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefon</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+48 123 456 789"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Adres</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="ul. Przykładowa 1, 00-000 Miasto"
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notatki</Label>
                                    <textarea
                                        id="notes"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Dodatkowe informacje o kliencie..."
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" type="button" asChild disabled={processing} className="cursor-pointer">
                                        <Link href={index.url()}>Anuluj</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing} className="cursor-pointer">
                                        <LucideSave className="mr-2 h-4 w-4" />
                                        Zapisz klienta
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Klienci', href: index.url() },
        { title: 'Dodaj', href: '#' },
    ],
};
