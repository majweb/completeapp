import { Head, useForm } from '@inertiajs/react';
import { Copy, RefreshCcw } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { send as contactSend, refreshCaptcha as contactRefreshCaptcha } from '@/actions/App/Http/Controllers/ContactController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    captchaText: string;
    user: {
        name: string;
        email: string;
    } | null;
}

export default function ContactShow({ captchaText: initialCaptchaText, user }: Props) {
    const [currentCaptcha, setCurrentCaptcha] = useState(initialCaptchaText);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: 'pomysł',
        message: '',
        captcha: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(contactSend.url(), {
            onSuccess: () => {
                reset('message', 'captcha');
                refreshCaptcha(false);
            },
            onError: () => {
                refreshCaptcha(false);
            }
        });
    };

    const copyCaptcha = () => {
        navigator.clipboard.writeText(currentCaptcha);
        toast.success('Kod captcha został skopiowany!');
    };

    const refreshCaptcha = async (showToast = true) => {
        try {
            const response = await fetch(contactRefreshCaptcha.url(), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            setCurrentCaptcha(data.captchaText);
            setData('captcha', '');

            // Ponieważ fetch nie jest wywołaniem Inertia, musimy ręcznie wywołać toast
            if (showToast) {
                toast.success('Kod captcha został odświeżony!');
            }
        } catch (error) {
            console.error('Błąd odświeżania captcha:', error);
            toast.error('Nie udało się odświeżyć kodu captcha.');
        }
    };

    return (
        <>
            <Head title="Kontakt i opinie" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Kontakt i opinie</h1>
                </div>

                <div className="w-full">
                    <Card className="border-none shadow-none">
                        <CardHeader className="px-0 pt-0">
                            <CardDescription>
                                Masz pomysł na nową funkcjonalność, znalazłeś błąd lub chcesz ocenić naszą aplikację? Napisz do nas!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Imię i nazwisko</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        readOnly={!!user}
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                    />
                                    {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adres e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        readOnly={!!user}
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                    />
                                    {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Temat wiadomości</Label>
                                <Select
                                    value={data.subject}
                                    onValueChange={(value) => setData('subject', value)}
                                >
                                    <SelectTrigger id="subject" aria-invalid={!!errors.subject}>
                                        <SelectValue placeholder="Wybierz temat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pomysł">Pomysł na nową funkcjonalność</SelectItem>
                                        <SelectItem value="błąd">Zgłoszenie błędu</SelectItem>
                                        <SelectItem value="ocena">Ocena aplikacji</SelectItem>
                                        <SelectItem value="inne">Inne</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Twoja wiadomość</Label>
                                <Textarea
                                    id="message"
                                    rows={5}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Opisz swój pomysł lub błąd..."
                                    aria-invalid={!!errors.message}
                                    aria-describedby={errors.message ? 'message-error' : undefined}
                                />
                                {errors.message && <p id="message-error" className="text-sm text-destructive">{errors.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="captcha">Weryfikacja (Captcha)</Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 flex-1 items-center justify-center rounded-md border bg-muted font-mono text-lg tracking-widest select-all">
                                        {currentCaptcha}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={copyCaptcha}
                                        title="Kopiuj kod"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={refreshCaptcha}
                                        title="Odśwież kod"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Input
                                    id="captcha"
                                    value={data.captcha}
                                    onChange={(e) => setData('captcha', e.target.value)}
                                    placeholder="Wpisz kod powyżej"
                                    aria-invalid={!!errors.captcha}
                                    aria-describedby={errors.captcha ? 'captcha-error' : undefined}
                                    autoComplete="off"
                                />
                                {errors.captcha && <p id="captcha-error" className="text-sm text-destructive">{errors.captcha}</p>}
                            </div>

                            <div className="space-y-4">
                                {(errors as any).rate_limit && (
                                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                        {(errors as any).rate_limit}
                                    </div>
                                )}
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Wysyłanie...
                                        </>
                                    ) : (
                                        'Wyślij wiadomość'
                                    )}
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
