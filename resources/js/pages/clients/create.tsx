import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucideInfo, LucideMapPin, LucideSave } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { index, store } from '@/actions/App/Http/Controllers/ClientController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
        latitude: '' as string | number,
        longitude: '' as string | number,
        notes: '',
    });

    const [isGeocoding, setIsGeocoding] = useState(false);

    const geocodeAddress = async () => {
        if (!data.address) {
            return;
        }

        setIsGeocoding(true);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}`);
            const results = await response.json();

            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                setData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon,
                }));
                toast.success('Współrzędne zostały pobrane pomyślnie.');
            } else {
                toast.error('Nie znaleziono lokalizacji dla podanego adresu.');
            }
        } catch (error) {
            console.error('Błąd geokodowania:', error);
            toast.error('Wystąpił błąd podczas pobierania współrzędnych.');
        } finally {
            setIsGeocoding(false);
        }
    };

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

                                <div className="space-y-4">
                                    <Alert variant="warning">
                                        <LucideInfo className="h-4 w-4" />
                                        <AlertTitle>Jak poprawnie uzupełnić adres?</AlertTitle>
                                        <AlertDescription>
                                            Podaj pełny adres w formacie: <span className="font-semibold italic text-foreground">Przykładowa 1, 00-000 Miasto</span>
                                            Poprawny format adresu pozwala systemowi na automatyczne pobranie współrzędnych geograficznych.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Adres</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Przykładowa 1, 00-000 Miasto"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={geocodeAddress}
                                                disabled={isGeocoding || !data.address}
                                                title="Pobierz współrzędne na podstawie adresu"
                                            >
                                                <LucideMapPin className={`h-4 w-4 ${isGeocoding ? 'animate-pulse text-primary' : ''}`} />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Kliknij przycisk pinezki, aby sprawdzić i pobrać lokalizację na mapie przed zapisem.
                                        </p>
                                        <InputError message={errors.address} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Szerokość geograficzna (Lat)</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            placeholder="np. 52.2297"
                                        />
                                        <InputError message={errors.latitude} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Długość geograficzna (Lon)</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            placeholder="np. 21.0122"
                                        />
                                        <InputError message={errors.longitude} />
                                    </div>
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
