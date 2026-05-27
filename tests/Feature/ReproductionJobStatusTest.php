<?php

use App\Enums\JobStatus;
use App\Models\Client;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $this->owner = User::factory()->create(['company_id' => $this->company->id, 'role' => 'owner']);
    $this->technician = User::factory()->create(['company_id' => $this->company->id, 'role' => 'technician']);

    $this->client = Client::create(['name' => 'Test Client', 'company_id' => $this->company->id]);
    $this->template = JobTemplate::create([
        'name' => 'Test Template',
        'company_id' => $this->company->id,
        'structure' => [],
    ]);

    $this->completedJob = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->technician->id,
        'status' => JobStatus::COMPLETED,
        'scheduled_at' => now()->subDay(),
        'started_at' => now()->subDay(),
        'completed_at' => now()->subDay(),
    ]);
});

test('technician cannot update completed job', function () {
    $this->actingAs($this->technician);

    $response = $this->put(route('jobs.update', $this->completedJob), [
        'report_summary' => 'Updated summary',
    ]);

    $response->assertStatus(403);
});

test('owner can update completed job', function () {
    $this->actingAs($this->owner);

    $response = $this->put(route('jobs.update', $this->completedJob), [
        'report_summary' => 'Owner update',
    ]);

    $response->assertStatus(302); // Redirect back on success
    expect($this->completedJob->fresh()->report_summary)->toBe('Owner update');
});
