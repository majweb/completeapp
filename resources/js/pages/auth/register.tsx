import { Head, Link, router, useForm } from '@inertiajs/react';
import { LucideUser, LucideMail, LucideLock, LucideBuilding2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, privacy, terms } from '@/routes';
import auth from '@/routes/auth';
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
        terms: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleGeneratePassword = (password: string) => {
        setData((prev) => ({
            ...prev,
            password,
            password_confirmation: password,
        }));
    };

    return (
        <>
            <Head title="Rejestracja" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {/* Sekcja: Firma */}
                    <div className="grid gap-4">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Dane firmy
                        </h3>
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Nazwa firmy</Label>
                            <div className="relative">
                                <LucideBuilding2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            />
                        </div>
                    </div>

                    <div className="border-t pt-2" />

                    {/* Sekcja: Opiekun */}
                    <div className="grid gap-4">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Opiekun konta
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Imię i nazwisko</Label>
                                <div className="relative">
                                    <LucideUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Adres email</Label>
                                <div className="relative">
                                    <LucideMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <InputError message={errors.name} />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="border-t pt-2" />

                    {/* Sekcja: Bezpieczeństwo */}
                    <div className="grid gap-4">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Bezpieczeństwo
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Hasło</Label>
                                <div className="relative">
                                    <LucideLock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        onGenerate={handleGeneratePassword}
                                        placeholder="Hasło"
                                        passwordrules={passwordRules}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Potwierdź hasło
                                </Label>
                                <div className="relative">
                                    <LucideLock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            </div>
                        </div>
                        <InputError message={errors.password} />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-start space-x-2 py-2">
                        <Checkbox
                            id="terms"
                            checked={data.terms}
                            onCheckedChange={(checked) => setData('terms', !!checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Akceptuję <Link href={terms().url} className="text-[#f53003] hover:underline" target="_blank">Regulamin</Link> oraz <Link href={privacy().url} className="text-[#f53003] hover:underline" target="_blank">Politykę Prywatności</Link>
                            </Label>
                            <InputError message={errors.terms} />
                        </div>
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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Lub kontynuuj przez
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => router.visit(auth.google().url)}
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
                    Google
                </Button>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Załóż darmowe konto',
    description: 'Wprowadź dane swojej firmy poniżej, aby rozpocząć.',
};
