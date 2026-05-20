import { Head, useForm } from '@inertiajs/react';
import { LucideUser, LucideMail, LucideLock, LucideBuilding2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Rejestracja" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Nazwa firmy</Label>
                        <div className="relative">
                            <LucideBuilding2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="company_name"
                                type="text"
                                autoFocus
                                tabIndex={1}
                                name="company_name"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                placeholder="np. Moja Firma Serwisowa"
                                className="pl-10"
                            />
                        </div>
                        <InputError
                            message={errors.company_name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Imię i nazwisko</Label>
                        <div className="relative">
                            <LucideUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                type="text"
                                tabIndex={2}
                                autoComplete="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Jan Kowalski"
                                className="pl-10"
                            />
                        </div>
                        <InputError
                            message={errors.name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Adres email</Label>
                        <div className="relative">
                            <LucideMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                tabIndex={3}
                                autoComplete="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                className="pl-10"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Hasło</Label>
                        <div className="relative">
                            <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <PasswordInput
                                id="password"
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Hasło"
                                passwordrules={passwordRules}
                                className="pl-10"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Potwierdź hasło
                        </Label>
                        <div className="relative">
                            <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <PasswordInput
                                id="password_confirmation"
                                tabIndex={5}
                                autoComplete="new-password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Potwierdź hasło"
                                passwordrules={passwordRules}
                                className="pl-10"
                            />
                        </div>
                        <InputError
                            message={errors.password_confirmation}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full cursor-pointer"
                        tabIndex={6}
                        disabled={processing}
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Załóż konto
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Masz już konto?{' '}
                    <TextLink href={login()} tabIndex={7}>
                        Zaloguj się
                    </TextLink>
                </div>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Załóż darmowe konto',
    description: 'Wprowadź dane swojej firmy poniżej, aby rozpocząć.',
};
