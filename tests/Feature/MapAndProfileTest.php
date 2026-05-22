<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Job;
use App\Models\Company;
use App\Models\JobTemplate;
use App\Enums\JobStatus;

test('owner can access profile edit page', function () {
    $user = User::factory()->create(['role' => 'owner']);

    $response = $this->actingAs($user)->get(route('profile.edit'));

    $response->assertStatus(200);
});

test('user can update their profile name and email', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);

    $response->assertRedirect();
    expect($user->fresh()->name)->toBe('New Name');
    expect($user->fresh()->email)->toBe('new@example.com');
});

test('client can have latitude and longitude', function () {
    $company = Company::factory()->create();
    $client = Client::factory()->create([
        'company_id' => $company->id,
        'latitude' => 52.2297,
        'longitude' => 21.0122
    ]);

    expect($client->latitude)->toBe(52.2297);
    expect($client->longitude)->toBe(21.0122);
});

test('dashboard provides map_jobs data for owners', function () {
    $company = Company::factory()->create();
    $user = User::factory()->create(['role' => 'owner', 'company_id' => $company->id]);
    $client = Client::factory()->create([
        'company_id' => $company->id,
        'latitude' => 52.2297,
        'longitude' => 21.0122
    ]);
    $template = JobTemplate::factory()->create(['company_id' => $company->id]);

    Job::factory()->create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'status' => JobStatus::IN_PROGRESS,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->has('map_jobs', 1)
        ->where('map_jobs.0.client_name', $client->name)
    );
});
