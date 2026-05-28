import { Head, Link, useForm } from '@inertiajs/react';
import { LucideArrowLeft, LucideInfo, LucideMapPin, LucideNavigation, LucideSave } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { index, store } from '@/actions/App/Http/Controllers/ClientController';
import InputError from '@/components/input-error';
import { LocationMap } from '@/components/location-map';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [isLocating, setIsLocating] = useState(false);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);

    const geocodeAddress = async () => {
        if (!data.address) {
            return;
        }

        setIsGeocoding(true);
        setGeocodingError(null);

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
                setData((prev) => ({
                    ...prev,
                    latitude: '',
                    longitude: '',
                }));
                setGeocodingError('Nie znaleziono lokalizacji. Spróbuj dodać miasto lub kod pocztowy.');
                toast.error('Nie znaleziono lokalizacji dla podanego adresu.');
            }
        } catch (error) {
            console.error('Błąd geokodowania:', error);
            setData((prev) => ({
                ...prev,
                latitude: '',
                longitude: '',
            }));
            setGeocodingError('Błąd połączenia z usługą map.');
            toast.error('Wystąpił błąd podczas pobierania współrzędnych.');
        } finally {
            setIsGeocoding(false);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Twoja przeglądarka nie wspiera geolokalizacji.');

            return;
        }

        setIsLocating(true);
        setGeocodingError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setData((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
                setIsLocating(false);
                toast.success('Pobrano Twoją aktualną lokalizację.');
            },
            (error) => {
                console.error('Błąd geolokalizacji:', error);
                setIsLocating(false);
                let message = 'Nie udało się pobrać lokalizacji.';

                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Brak uprawnień do pobrania lokalizacji.';
                }

                toast.error(message);
            },
            { enableHighAccuracy: true },
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Dodaj Klienta" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button variant="outline" size="icon" asChild className="shrink-0 cursor-pointer">
                        <Link href={index.url()} preserveScroll>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dodaj nowego klienta</h1>
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
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => {
                                                    setData('address', e.target.value);
                                                    setGeocodingError(null);
                                                }}
                                                placeholder="Przykładowa 1, 00-000 Miasto"
                                                className="flex-1"
                                            />
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={geocodeAddress}
                                                    disabled={isGeocoding || isLocating || !data.address}
                                                    title="Pobierz współrzędne na podstawie adresu"
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <LucideMapPin className={`h-4 w-4 mr-2 sm:mr-0 ${isGeocoding ? 'animate-pulse text-primary' : ''}`} />
                                                    <span className="sm:hidden">Pobierz z adresu</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={useCurrentLocation}
                                                    disabled={isGeocoding || isLocating}
                                                    title="Użyj mojej aktualnej lokalizacji"
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    <LucideNavigation className={`h-4 w-4 mr-2 sm:mr-0 ${isLocating ? 'animate-pulse text-primary' : ''}`} />
                                                    <span className="sm:hidden">Użyj GPS</span>
                                                </Button>
                                            </div>
                                        </div>
                                        {geocodingError && <p className="text-sm font-medium text-destructive mt-1">{geocodingError}</p>}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Kliknij przycisk pinezki, aby pobrać lokalizację z adresu lub strzałki, aby użyć pozycji GPS.
                                        </p>
                                        <InputError message={errors.address} />
                                    </div>
                                </div>

                                {(isGeocoding || isLocating || data.latitude || data.longitude) && (
                                    <div className="grid gap-6 md:grid-cols-2 mt-4">
                                        <div className="space-y-4 order-2 md:order-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-muted-foreground">Współrzędne geograficzne</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="latitude">Szerokość geograficzna (Lat)</Label>
                                                    <Input
                                                        id="latitude"
                                                        type="number"
                                                        step="any"
                                                        value={data.latitude}
                                                        onChange={(e) => setData('latitude', e.target.value)}
                                                        placeholder="np. 52.2297"
                                                        disabled={isGeocoding || isLocating}
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
                                                        disabled={isGeocoding || isLocating}
                                                    />
                                                    <InputError message={errors.longitude} />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">
                                                Możesz ręcznie korygować współrzędne lub przeciągać marker na mapie.
                                            </p>
                                        </div>

                                        <div className="h-[250px] sm:h-[300px] flex items-center justify-center order-1 md:order-2">
                                            {isGeocoding || isLocating ? (
                                                <div className="relative w-full h-full rounded-md border bg-muted/30 flex flex-col items-center justify-center gap-3 overflow-hidden">
                                                    <Skeleton className="absolute inset-0 h-full w-full" />
                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                        <div className="relative">
                                                            <LucideMapPin className="h-10 w-10 text-primary/40" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                                            {isGeocoding ? 'Pobieranie współrzędnych...' : 'Pobieranie lokalizacji GPS...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                (data.latitude || data.longitude) && (
                                                    <LocationMap
                                                        lat={data.latitude}
                                                        lng={data.longitude}
                                                        onChange={(lat, lng) => {
                                                            setData((prev) => ({
                                                                ...prev,
                                                                latitude: lat,
                                                                longitude: lng,
                                                            }));
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

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

                                <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
                                    <Button variant="outline" type="button" asChild disabled={processing} className="w-full md:w-auto cursor-pointer order-2 md:order-1">
                                        <Link href={index.url()} preserveScroll>Anuluj</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing} className="w-full md:w-auto cursor-pointer order-1 md:order-2">
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
