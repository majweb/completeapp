import { Head, useForm } from '@inertiajs/react';
import React from 'react';

import { update as updateCompanyAction } from '@/actions/App/Http/Controllers/CompanyController';
import ImageUpload from '@/components/image-upload';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/company';

interface Company {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    vat_number: string | null;
    primary_color: string;
    logo_url: string | null;
}

export default function Edit({ company }: { company: Company }) {
    const { data, setData, post, processing, errors } = useForm({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        vat_number: company.vat_number || '',
        primary_color: company.primary_color || '#000000',
        logo: null as File | null,
        remove_logo: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(updateCompanyAction.url(), {
            forceFormData: true,
            onSuccess: () => {
                setData('remove_logo', false);
                setData('logo', null);
            },
        });
    };

    return (
        <>
            <Head title="Ustawienia firmy" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ustawienia firmy</CardTitle>
                        <CardDescription>
                            Zarządzaj danymi swojej firmy i brandingiem raportów.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nazwa firmy</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vat_number">NIP / VAT ID</Label>
                                    <Input
                                        id="vat_number"
                                        value={data.vat_number}
                                        onChange={(e) => setData('vat_number', e.target.value)}
                                    />
                                    <InputError message={errors.vat_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="primary_color">Kolor główny (PDF)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="primary_color"
                                            type="color"
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            className="flex-1"
                                            placeholder="#000000"
                                        />
                                    </div>
                                    <InputError message={errors.primary_color} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Adres</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail firmowy</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <ImageUpload
                                value={data.logo}
                                onChange={(file) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        logo: file,
                                        remove_logo: file === null && !company.logo_url ? false : file === null,
                                    }));
                                }}
                                imageUrl={data.remove_logo ? null : company.logo_url}
                                label="Logo firmy"
                                description="Maksymalnie 2MB. Format JPG, PNG. Zalecane proporcje 16:9."
                                aspect={16 / 9}
                                error={errors.logo}
                            />

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Zapisz zmiany
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Ustawienia firmy',
            href: edit.url(),
        },
    ],
};
