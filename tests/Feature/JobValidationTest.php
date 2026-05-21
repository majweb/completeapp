<?php

use App\Models\Client;
use App\Models\Company;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $this->user = User::factory()->create(['company_id' => $this->company->id, 'role' => 'owner']);
    $this->actingAs($this->user);

    $this->client = Client::create(['name' => 'Test Client', 'company_id' => $this->company->id]);
    $this->template = JobTemplate::create([
        'name' => 'Test Template',
        'company_id' => $this->company->id,
        'structure' => [],
    ]);
});

test('cannot create job with past date', function () {
    $response = $this->post(route('jobs.store'), [
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'scheduled_at' => now()->subDay()->format('Y-m-d H:i'),
    ]);

    $response->assertSessionHasErrors('scheduled_at');
});

test('can create job with today date', function () {
    $response = $this->post(route('jobs.store'), [
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'scheduled_at' => now()->format('Y-m-d H:i'),
    ]);

    $response->assertSessionDoesntHaveErrors('scheduled_at');
});
