<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('użytkownik widzi tylko dane swojej firmy', function () {
    // Tworzymy dwie firmy
    $company1 = Company::create(['name' => 'Firma 1', 'slug' => 'firma-1']);
    $company2 = Company::create(['name' => 'Firma 2', 'slug' => 'firma-2']);

    // Tworzymy użytkowników dla każdej firmy
    $user1 = User::factory()->create(['company_id' => $company1->id]);
    $user2 = User::factory()->create(['company_id' => $company2->id]);

    // Logujemy użytkownika 1 i sprawdzamy, czy widzi tylko swoją firmę w zasięgu User
    $this->actingAs($user1);

    expect(User::count())->toBe(1)
        ->and(User::first()->company_id)->toBe($company1->id);

    // Logujemy użytkownika 2
    $this->actingAs($user2);

    expect(User::count())->toBe(1)
        ->and(User::first()->company_id)->toBe($company2->id);
});

test('nowi użytkownicy są automatycznie przypisywani do firmy zalogowanego użytkownika', function () {
    $company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $admin = User::factory()->create(['company_id' => $company->id]);

    $this->actingAs($admin);

    $newUser = User::create([
        'name' => 'New Technician',
        'email' => 'tech@test.com',
        'password' => bcrypt('password'),
    ]);

    expect($newUser->company_id)->toBe($company->id);
});

test('klienci są izolowani między firmami', function () {
    $company1 = Company::create(['name' => 'Firma A', 'slug' => 'firma-a']);
    $company2 = Company::create(['name' => 'Firma B', 'slug' => 'firma-b']);

    $user1 = User::factory()->create(['company_id' => $company1->id]);
    $user2 = User::factory()->create(['company_id' => $company2->id]);

    // Dodajemy klienta do Firmy A
    $this->actingAs($user1);
    \App\Models\Client::create(['name' => 'Klient Firmy A']);

    // Sprawdzamy widoczność
    expect(\App\Models\Client::count())->toBe(1);

    // Przełączamy na użytkownika Firmy B
    $this->actingAs($user2);
    expect(\App\Models\Client::count())->toBe(0);

    // Dodajemy klienta do Firmy B
    \App\Models\Client::create(['name' => 'Klient Firmy B']);
    expect(\App\Models\Client::count())->toBe(1);
    expect(\App\Models\Client::first()->name)->toBe('Klient Firmy B');
});
