<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Wyłącz SSR dla zalogowanych użytkowników, aby uniknąć problemów z Leaflet/lodash i zmniejszyć obciążenie
        if ($request->user()) {
            config(['inertia.ssr.enabled' => false]);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'avatar_url' => $request->user()->avatar_url,
                    'company' => $request->user()->company,
                    'is_demo' => (bool) $request->user()->is_demo,
                ] : null,
                'impersonated_by' => session('impersonated_by'),
            ],
            'subscription' => $request->user() && $request->user()->company ? [
                'exceedsTechniciansLimit' => app(SubscriptionService::class)->exceedsLimit($request->user()->company, 'technicians'),
                'exceedsJobsLimit' => app(SubscriptionService::class)->exceedsLimit($request->user()->company, 'jobs_per_month'),
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'toast' => $request->session()->get('inertia.flash_data.toast'),
            ],
            'features' => [
                'openai' => config('services.openai.enabled', false),
            ],
        ];
    }
}
