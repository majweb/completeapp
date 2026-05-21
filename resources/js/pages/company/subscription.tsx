import { Head, useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { subscribe } from '@/actions/App/Http/Controllers/CompanyController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

interface Props {
    subscribed: boolean;
    subscription: any;
    plans: Plan[];
    intent: any;
}

export default function Subscription({ subscribed, subscription, plans }: Props) {
    const { data, setData, post, processing } = useForm({
        plan: '',
    });

    const handleSubscribe = (planId: string) => {
        setData('plan', planId);
    };

    useEffect(() => {
        if (data.plan) {
            post(subscribe().url, {
                onFinish: () => setData('plan', ''),
            });
        }
    }, [data.plan, post, setData]);

    return (
        <>
            <Head title="Subskrypcja" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold">Twoja Subskrypcja</h2>
                        <p className="text-muted-foreground">Zarządzaj planem i płatnościami swojej firmy.</p>
                    </div>

                    {subscribed ? (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Aktywny Plan: {subscription.type}</CardTitle>
                                <CardDescription>
                                    Twoja subskrypcja jest aktywna. Możesz ją zmienić lub anulować w dowolnym momencie.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline">Zarządzaj w Stripe</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <Card key={plan.id} className={plan.name === 'Pro' ? 'border-primary' : ''}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            {plan.name}
                                            {plan.name === 'Pro' && <Badge>Polecany</Badge>}
                                        </CardTitle>
                                        <div className="text-3xl font-bold mt-2">
                                            {plan.price === 0 ? 'Darmowy' : `${plan.price} zł`}
                                            <span className="text-sm font-normal text-muted-foreground">/msc</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-sm">
                                                    <Check className="h-4 w-4 text-primary mr-2" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="w-full"
                                            variant={plan.name === 'Pro' ? 'default' : 'outline'}
                                            disabled={processing}
                                            onClick={() => handleSubscribe(plan.id)}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Przekierowywanie...
                                                </>
                                            ) : (
                                                'Wybierz Plan'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>Płatności obsługiwane bezpiecznie przez Stripe.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
