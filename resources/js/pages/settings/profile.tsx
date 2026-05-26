import { Form, Head, usePage, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { LucideCheckCircle, LucideAlertCircle } from 'lucide-react';
import React from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import auth_routes from '@/routes/auth';
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

                <div className="pt-6 border-t">
                    <Heading
                        variant="small"
                        title="Konto Google"
                        description="Zarządzaj powiązaniem swojego konta z Google"
                    />

                    <div className="mt-4">
                        {auth.user.google_id ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <LucideCheckCircle className="h-4 w-4" />
                                <span>Twoje konto jest powiązane z Google.</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <LucideAlertCircle className="h-4 w-4" />
                                    <span>Twoje konto nie jest powiązane z Google.</span>
                                </div>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => router.visit(auth_routes.google().url)}
                                >
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        aria-hidden="true"
                                        focusable="false"
                                        data-prefix="fab"
                                        data-icon="google"
                                        role="img"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 488 512"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                        ></path>
                                    </svg>
                                    Połącz z Google
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
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
