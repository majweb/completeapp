<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Config;

class SubscriptionService
{
    /**
     * Check if the application is in free mode.
     */
    public function isFreeMode(): bool
    {
        return (bool) Config::get('app.free_mode', false);
    }

    /**
     * Check if the company has an active subscription or if free mode is enabled.
     */
    public function canAccessFeature(Company $company, string $feature = 'default'): bool
    {
        if ($this->isFreeMode()) {
            return true;
        }

        return $company->subscribed('pro') || $company->subscribed('enterprise');
    }

    /**
     * Get limits for a company based on their subscription plan.
     */
    public function getLimit(Company $company, string $limitName): int
    {
        if ($this->isFreeMode()) {
            return 999999; // Virtually unlimited
        }

        $plan = $company->subscription('pro')?->type
            ?? $company->subscription('enterprise')?->type
            ?? 'free';

        $limits = [
            'free' => [
                'technicians' => 2,
                'jobs_per_month' => 10,
            ],
            'pro' => [
                'technicians' => 5,
                'jobs_per_month' => 50,
            ],
            'enterprise' => [
                'technicians' => 100,
                'jobs_per_month' => 1000,
            ],
        ];

        return $limits[$plan][$limitName] ?? 0;
    }

    /**
     * Check if company exceeds limits (useful after downgrade).
     */
    public function exceedsLimit(Company $company, string $limitName): bool
    {
        if ($this->isFreeMode()) {
            return false;
        }

        $limit = $this->getLimit($company, $limitName);

        if ($limitName === 'technicians') {
            $count = $company->users()->whereIn('role', ['technician', 'manager'])->count();
            return $count > $limit;
        }

        if ($limitName === 'jobs_per_month') {
            $count = $company->jobs()->whereMonth('created_at', now()->month)->count();
            return $count > $limit;
        }

        return false;
    }
}
