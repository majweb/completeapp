<?php

use App\Models\Company;
use App\Models\User;
use App\Models\Client;
use App\Models\Job;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('deleting a demo company deletes its jobs', function () {
    // 1. Tworzymy firmę demo
    $company = Company::forceCreate([
        'name' => 'Demo Company',
        'slug' => 'demo-company',
        'is_demo' => true,
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2),
    ]);

    // 2. Tworzymy klienta
    $client = Client::create([
        'name' => 'Demo Client',
        'company_id' => $company->id,
    ]);

    // 3. Tworzymy zlecenie
    $job = Job::create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'status' => \App\Enums\JobStatus::NEW,
    ]);

    expect(Job::where('company_id', $company->id)->count())->toBe(1);

    // 4. Uruchamiamy zadanie czyszczące (logika z console.php)
    Company::where('is_demo', true)
        ->where('created_at', '<', now()->subDay())
        ->each(fn ($company) => $company->delete());

    // 5. Sprawdzamy czy firma została usunięta
    expect(Company::find($company->id))->toBeNull();

    // 6. Sprawdzamy czy zlecenie zostało usunięte
    expect(Job::where('company_id', $company->id)->count())->toBe(0);
});
