<?php

use App\Models\User;
use App\Models\Company;

test('użytkownik może zalogować się jako demo', function () {
    $response = $this->post(route('demo.login'));

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = auth()->user();
    expect($user->is_demo)->toBeTrue();
    expect($user->company->is_demo)->toBeTrue();

    // Sprawdzamy czy dodano dodatkowych użytkowników (owner, manager, technician)
    expect($user->company->users)->toHaveCount(3);
    expect($user->company->users()->where('role', 'owner')->count())->toBe(1);
    expect($user->company->users()->where('role', 'manager')->count())->toBe(1);
    expect($user->company->users()->where('role', 'technician')->count())->toBe(1);

    // Sprawdzamy czy dodano szablon i zlecenia
    expect($user->company->jobTemplates)->toHaveCount(1);
    expect($user->company->jobs)->toHaveCount(6); // 3 klientów * 2 zlecenia
    expect($user->company->jobs()->whereNotNull('template_id')->count())->toBe(6);
    expect(\App\Models\Checklist::count())->toBe(6);
});

test('stare konta demo są usuwane przez zadanie harmonogramu', function () {
    // Tworzymy stare konto demo
    $oldCompany = Company::factory()->create([
        'is_demo' => true,
        'created_at' => now()->subDays(2),
    ]);

    // Tworzymy nowe konto demo
    $newCompany = Company::factory()->create([
        'is_demo' => true,
        'created_at' => now(),
    ]);

    // Tworzymy normalną firmę (nie demo) starszą niż 24h
    $normalCompany = Company::factory()->create([
        'is_demo' => false,
        'created_at' => now()->subDays(2),
    ]);

    // Uruchamiamy zadanie czyszczenia
    Company::where('is_demo', true)
        ->where('created_at', '<', now()->subDay())
        ->each(fn ($company) => $company->delete());

    // Sprawdzamy wyniki
    $this->assertDatabaseMissing('companies', ['id' => $oldCompany->id]);
    $this->assertDatabaseHas('companies', ['id' => $newCompany->id]);
    $this->assertDatabaseHas('companies', ['id' => $normalCompany->id]);
});

test('użytkownik demo nie może wysłać raportu', function () {
    $this->post(route('demo.login'));
    $user = auth()->user();
    $job = $user->company->jobs()->first();

    $response = $this->post(route('jobs.sendReport', $job));

    $response->assertSessionHas('error', 'Wersja Demo: wysyłanie raportów jest zablokowane.');
});

test('użytkownik demo nie może tworzyć zleceń', function () {
    $this->post(route('demo.login'));
    $user = auth()->user();

    $response = $this->post(route('jobs.store'), [
        'client_id' => 1,
        'template_id' => 1,
        'scheduled_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertSessionHas('inertia.flash_data.toast');
    $toast = session('inertia.flash_data.toast');
    expect($toast['message'])->toBe('Dodawanie zleceń jest zablokowane w wersji demo.');
});

test('użytkownik demo nie może tworzyć klientów', function () {
    $this->post(route('demo.login'));
    $user = auth()->user();

    $response = $this->post(route('clients.store'), [
        'name' => 'New Client',
        'email' => 'client@example.com',
    ]);

    $response->assertSessionHas('inertia.flash_data.toast');
    $toast = session('inertia.flash_data.toast');
    expect($toast['message'])->toBe('Dodawanie klientów jest zablokowane w wersji demo.');
});

test('użytkownik demo nie może tworzyć szablonów', function () {
    $this->post(route('demo.login'));
    $user = auth()->user();

    $response = $this->post(route('job-templates.store'), [
        'name' => 'New Template',
        'description' => 'Desc',
        'structure' => [],
    ]);

    $response->assertSessionHas('inertia.flash_data.toast');
    $toast = session('inertia.flash_data.toast');
    expect($toast['message'])->toBe('Tworzenie szablonów jest zablokowane w wersji demo.');
});

test('użytkownik demo nie może tworzyć techników', function () {
    $this->post(route('demo.login'));
    $user = auth()->user();

    $response = $this->post(route('technicians.store'), [
        'name' => 'New Tech',
        'email' => 'tech@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'technician',
    ]);

    $response->assertSessionHas('inertia.flash_data.toast');
    $toast = session('inertia.flash_data.toast');
    expect($toast['message'])->toBe('Dodawanie techników jest zablokowane w wersji demo.');
});

test('użytkownik demo nie ma dostępu do subskrypcji', function () {
    $this->post(route('demo.login'));

    $this->get(route('subscription.index'))
        ->assertRedirect(route('dashboard'));

    $this->post(route('subscription.subscribe'), ['plan' => 'pro'])
        ->assertStatus(403);

    $this->get(route('subscription.invoices'))
        ->assertRedirect(route('dashboard'));
});
