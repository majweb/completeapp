<?php

use App\Models\Company;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    // Usuwamy firmy demo starsze niż 24h (wraz z użytkownikami i danymi dzięki kaskadzie w bazie)
    Company::where('is_demo', true)
        ->where('created_at', '<', now()->subDay())
        ->each(fn ($company) => $company->delete());
})->everyMinute();
