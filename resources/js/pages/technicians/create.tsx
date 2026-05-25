import { Head, useForm, Link } from '@inertiajs/react';
import { LucideUser, LucideMail, LucideLock, LucideShieldCheck, LucideRefreshCw, LucideArrowLeft, LucideLoader2 } from 'lucide-react';
import React from 'react';

import { store } from '@/actions/App/Http/Controllers/TechnicianController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as techniciansIndex } from '@/routes/technicians';

interface Props {
    canAddMore: boolean;
    limit: number;
}

export default function Create({ canAddMore, limit }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'technician',
        is_active: true,
        send_credentials: false,
    });

    const generatePassword = () => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let retVal = '';

        for (let i = 0; i < 12; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setData('password', retVal);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <>
            <Head title="Dodaj technika" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={techniciansIndex()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Dodaj technika</h1>
                        <p className="text-muted-foreground">Wprowadź dane dostępowe dla nowego pracownika.</p>
                    </div>
                </div>

                {!canAddMore && (
                    <Card className="border-destructive bg-destructive/10">
                        <CardContent className="pt-6">
                            <p className="text-destructive font-medium text-center">
                                Osiągnięto limit techników ({limit}) dla Twojego planu.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Dane pracownika</CardTitle>
                        <CardDescription>
                            Technik będzie mógł logować się do aplikacji mobilnej przy użyciu tych danych.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Imię i nazwisko</Label>
                                <div className="relative">
                                    <LucideUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="pl-10"
                                        placeholder="np. Jan Kowalski"
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <LucideMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pl-10"
                                        placeholder="jan@firma.pl"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Hasło</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="text"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10"
                                            placeholder="min. 8 znaków"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generatePassword}
                                        title="Generuj losowe hasło"
                                        className="cursor-pointer"
                                    >
                                        <LucideRefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Rola</Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <LucideShieldCheck className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Wybierz rolę" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technician">Technik (User mobilny)</SelectItem>
                                        <SelectItem value="manager">Manager (Dostęp webowy)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                            </div>

                            <div className="flex flex-col gap-4 py-2 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="is_active" className="cursor-pointer font-medium">Konto aktywne</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Nieaktywni użytkownicy nie mogą logować się do systemu.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="send_credentials"
                                        checked={data.send_credentials}
                                        onCheckedChange={(checked) => setData('send_credentials', !!checked)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor="send_credentials" className="cursor-pointer font-medium">Wyślij dane do logowania</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Użytkownik otrzyma e-mail z hasłem i instrukcją logowania.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={processing || !canAddMore} className="w-full cursor-pointer">
                                    {processing ? (
                                        <>
                                            <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Trwa dodawanie...
                                        </>
                                    ) : (
                                        'Dodaj technika'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => {
    // Reusing the same layout structure as index
    return page;
};
