import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import React from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { PageProps } from '@/types';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Ustawienia profilu" />

            <h1 className="sr-only">Ustawienia profilu</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Informacje o profilu"
                    description="Zaktualizuj swoją nazwę i adres e-mail"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing: formProcessing, errors: formErrors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nazwa</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Imię i nazwisko"
                                />

                                <InputError
                                    className="mt-2"
                                    message={formErrors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Adres e-mail</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Adres e-mail"
                                />

                                <InputError
                                    className="mt-2"
                                    message={formErrors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Twój adres e-mail jest niezweryfikowany.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Kliknij tutaj, aby ponownie wysłać e-mail weryfikacyjny.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                Nowy link weryfikacyjny został wysłany na Twój adres e-mail.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={formProcessing}
                                    data-test="update-profile-button"
                                >
                                    Zapisz
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Ustawienia profilu',
            href: edit(),
        },
    ],
};
