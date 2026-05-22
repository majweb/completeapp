<?php

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\{actingAs, post, get};

uses(RefreshDatabase::class);

test('admin can start and stop impersonating correctly', function () {
    $company = Company::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'technician', 'company_id' => $company->id]);

    // 1. Log in as Admin
    actingAs($admin);
    expect(auth()->id())->toBe($admin->id);

    // 2. Start impersonating
    $response = post(route('admin.impersonate', $user));
    $response->assertRedirect(route('dashboard'));

    // Check if we are now the user
    expect(auth()->id())->toBe($user->id);
    expect(session('impersonated_by'))->toBe($admin->id);

    // 3. Stop impersonating
    // We are currently acting as $user
    $response = post(route('admin.stop-impersonating'));

    // Check if we are back to being the admin
    expect(auth()->id())->toBe($admin->id);
    expect(session()->has('impersonated_by'))->toBeFalse();

    $response->assertRedirect(route('admin.users'));

    // 5. Verify access to admin routes
    get(route('admin.users'))->assertStatus(200);
});

test('stop impersonating fails gracefully if session is missing', function () {
    $user = User::factory()->create(['role' => 'technician']);

    actingAs($user);

    $response = post(route('admin.stop-impersonating'));
    $response->assertRedirect('/dashboard');
    expect(auth()->id())->toBe($user->id);
});
