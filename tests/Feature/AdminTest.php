<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can access users list', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('admin.users'));

    $response->assertStatus(200);
});

test('admin is redirected from company routes when not impersonating', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.users'));

    $this->actingAs($admin)
        ->get(route('clients.index'))
        ->assertRedirect(route('admin.users'));
});

test('admin can access company routes when impersonating', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $company = \App\Models\Company::factory()->create();
    $user = User::factory()->create(['role' => 'owner', 'company_id' => $company->id]);

    // Musimy symulować zalogowanie jako user i posiadanie sesji impersonated_by
    $this->actingAs($user)
        ->withSession(['impersonated_by' => $admin->id])
        ->get(route('dashboard'))
        ->assertStatus(200);

    $this->actingAs($user)
        ->withSession(['impersonated_by' => $admin->id])
        ->get(route('clients.index'))
        ->assertStatus(200);
});

test('non-admin cannot access admin users list', function () {
    $user = User::factory()->create(['role' => 'owner']);

    $response = $this->actingAs($user)->get(route('admin.users'));

    $response->assertStatus(403);
});

test('admin can impersonate user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'technician']);

    $response = $this->actingAs($admin)->post(route('admin.impersonate', $user));

    $response->assertRedirect(route('dashboard'));
    $this->assertEquals($user->id, auth()->id());
    $this->assertEquals($admin->id, session('impersonated_by'));
});

test('admin can stop impersonating', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'technician']);

    $this->actingAs($admin)->post(route('admin.impersonate', $user));

    $response = $this->post(route('admin.stop-impersonating'));

    $response->assertRedirect(route('admin.users'));
    $this->assertEquals($admin->id, auth()->id());
    $this->assertFalse(session()->has('impersonated_by'));
});

test('admin is redirected to users list from dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertRedirect(route('admin.users'));
});

test('admin can see users from different companies', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $companyA = \App\Models\Company::factory()->create(['name' => 'Company A']);
    $companyB = \App\Models\Company::factory()->create(['name' => 'Company B']);

    User::factory()->create(['company_id' => $companyA->id, 'name' => 'User AAA']);
    User::factory()->create(['company_id' => $companyB->id, 'name' => 'User BBB']);

    $response = $this->actingAs($admin)->get(route('admin.users'));

    $response->assertStatus(200);

    $data = $response->viewData('page')['props']['users'];
    $usersData = is_array($data) ? $data['data'] : $data->toArray()['data'];
    $names = collect($usersData)->pluck('name');

    expect($names)->toContain('User AAA');
    expect($names)->toContain('User BBB');
});

test('admin can see jobs from different companies', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $companyA = \App\Models\Company::factory()->create(['name' => 'Company A']);
    $companyB = \App\Models\Company::factory()->create(['name' => 'Company B']);

    $clientA = \App\Models\Client::factory()->create(['company_id' => $companyA->id, 'name' => 'Client AAA']);
    $clientB = \App\Models\Client::factory()->create(['company_id' => $companyB->id, 'name' => 'Client BBB']);

    \App\Models\Job::factory()->create(['company_id' => $companyA->id, 'client_id' => $clientA->id]);
    \App\Models\Job::factory()->create(['company_id' => $companyB->id, 'client_id' => $clientB->id]);

    $response = $this->actingAs($admin)->get(route('admin.jobs'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/jobs')
        ->has('jobs.data')
    );

    $data = $response->viewData('page')['props']['jobs'];
    $jobsData = is_array($data) ? $data['data'] : $data->toArray()['data'];
    $clientNames = collect($jobsData)->pluck('client.name');

    expect($clientNames)->toContain('Client AAA');
    expect($clientNames)->toContain('Client BBB');
});
