import { Head, useForm, Link } from '@inertiajs/react';
import { LucideUser, LucideMail, LucideLock, LucideShieldCheck, LucideRefreshCw, LucideArrowLeft, LucideLoader2 } from 'lucide-react';
import React from 'react';

import { update } from '@/actions/App/Http/Controllers/TechnicianController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as techniciansIndex } from '@/routes/technicians';

interface Technician {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
}

interface Props {
    technician: Technician;
}

export default function Edit({ technician }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: technician.name,
        email: technician.email,
        password: '',
        role: technician.role,
        is_active: !!technician.is_active,
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
        put(update.url({ technician: technician.id }));
    };

    return (
        <>
            <Head title={`Edytuj technika: ${technician.name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="cursor-pointer">
                        <Link href={techniciansIndex()}>
                            <LucideArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edytuj technika</h1>
                        <p className="text-muted-foreground">Aktualizuj dane dla pracownika {technician.name}.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dane pracownika</CardTitle>
                        <CardDescription>
                            Możesz zmienić dane osobowe, rolę lub zresetować hasło.
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
                                <Label htmlFor="password">Nowe hasło (opcjonalnie)</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10"
                                            placeholder="pozostaw puste, aby nie zmieniać"
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
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={processing} className="w-full cursor-pointer">
                                    {processing ? (
                                        <>
                                            <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Trwa zapisywanie...
                                        </>
                                    ) : (
                                        'Zapisz zmiany'
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
