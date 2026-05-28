<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function subscription(SubscriptionService $subscriptionService)
    {
        if (auth()->user()->is_demo) {
            return redirect()->route('dashboard');
        }

        if ($subscriptionService->isFreeMode()) {
            return redirect()->route('dashboard');
        }

        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        return Inertia::render('company/subscription', [
            'subscribed' => $company->subscribed('main'),
            'subscription' => $company->subscription('main'),
            'intent' => $company->createSetupIntent(),
            'plans' => [
                ['id' => 'pro', 'name' => 'Pro', 'price' => 99, 'features' => ['10 techników', '100 zleceń/msc']],
                ['id' => 'enterprise', 'name' => 'Enterprise', 'price' => 299, 'features' => ['Nielimitowani technicy', 'Nielimitowane zlecenia']],
            ]
        ]);
    }

    public function subscribe(Request $request)
    {
        if (auth()->user()->is_demo) {
            abort(403, 'Wersja demo nie obsługuje płatności.');
        }

        $request->validate([
            'plan' => 'required|string|in:pro,enterprise',
        ]);

        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        $priceId = match ($request->plan) {
            'pro' => config('services.stripe.price_pro'),
            'enterprise' => config('services.stripe.price_enterprise'),
        };

        if (!$priceId) {
            return back()->withErrors(['plan' => 'Wybrany plan nie jest skonfigurowany w systemie.']);
        }

        return $company->newSubscription('main', $priceId)
            ->checkout([
                'success_url' => route('subscription.index') . '?success=1',
                'cancel_url' => route('subscription.index') . '?cancel=1',
            ]);
    }
    public function invoices()
    {
        if (auth()->user()->is_demo) {
            return redirect()->route('dashboard');
        }

        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        return Inertia::render('company/invoices', [
            'invoices' => $company->invoices()->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'total' => $invoice->total(),
                    'date' => $invoice->date()->toFormattedDateString(),
                    'status' => $invoice->status,
                ];
            }),
        ]);
    }

    public function downloadInvoice(Request $request, $invoiceId)
    {
        if (auth()->user()->is_demo) {
            abort(403);
        }

        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        return $company->downloadInvoice($invoiceId, [
            'vendor' => 'CompleteApp Service',
            'product' => 'Subskrypcja Systemu Zleceń',
        ]);
    }

    public function edit()
    {
        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        return Inertia::render('company/edit', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'address' => $company->address,
                'phone' => $company->phone,
                'email' => $company->email,
                'vat_number' => $company->vat_number,
                'primary_color' => $company->primary_color,
                'logo_url' => $company->getFirstMediaUrl('logo'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'vat_number' => 'nullable|string|max:50',
            'primary_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'logo' => 'nullable|image|max:2048',
        ], [], [
            'name' => 'nazwa firmy',
            'address' => 'adres',
            'phone' => 'telefon',
            'email' => 'e-mail',
            'vat_number' => 'NIP',
            'primary_color' => 'kolor główny',
            'logo' => 'logo',
        ]);

        $company->update($validated);

        if ($request->boolean('remove_logo')) {
            $company->clearMediaCollection('logo');
        }

        if ($request->hasFile('logo')) {
            $company->clearMediaCollection('logo');
            $company->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ustawienia firmy zostały zaktualizowane.',
        ]);

        return redirect()->back();
    }
}
