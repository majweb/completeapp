<?php

use App\Enums\JobStatus;
use App\Models\Client;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

uses(RefreshDatabase::class);

it('owner can approve completed job', function () {
    $company = Company::create(['name' => 'Cmp', 'slug' => 'cmp']);
    $owner = User::factory()->create([
        'role' => 'owner',
        'company_id' => $company->id,
    ]);

    $client = Client::create(['name' => 'Cli', 'company_id' => $company->id]);
    $template = JobTemplate::create(['name' => 'Tmp', 'company_id' => $company->id, 'structure' => []]);
    $technician = User::factory()->create(['role' => 'technician', 'company_id' => $company->id]);

    $job = Job::create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'assigned_to' => $technician->id,
        'status' => JobStatus::COMPLETED,
        'scheduled_at' => now(),
    ]);

    actingAs($owner);

    $response = post(route('jobs.approve', $job));

    $response->assertRedirect();
    $job->refresh();
    expect($job->status->value)->toBe('approved');
});

it('owner cannot update approved job', function () {
    $company = Company::create(['name' => 'Cmp', 'slug' => 'cmp']);
    $owner = User::factory()->create([
        'role' => 'owner',
        'company_id' => $company->id,
    ]);

    $client = Client::create(['name' => 'Cli', 'company_id' => $company->id]);
    $template = JobTemplate::create(['name' => 'Tmp', 'company_id' => $company->id, 'structure' => []]);
    $technician = User::factory()->create(['role' => 'technician', 'company_id' => $company->id]);

    $job = Job::create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'assigned_to' => $technician->id,
        'status' => 'approved',
        'scheduled_at' => now(),
    ]);

    actingAs($owner);

    $response = put(route('jobs.update', $job), [
        'client_id' => $client->id,
        'assigned_to' => $technician->id,
        'scheduled_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertStatus(403);
});

it('technician cannot upload media to approved job', function () {
    $company = Company::create(['name' => 'Cmp', 'slug' => 'cmp']);
    $technician = User::factory()->create([
        'role' => 'technician',
        'company_id' => $company->id,
    ]);

    $client = Client::create(['name' => 'Cli', 'company_id' => $company->id]);
    $template = JobTemplate::create(['name' => 'Tmp', 'company_id' => $company->id, 'structure' => []]);

    $job = Job::create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'assigned_to' => $technician->id,
        'status' => 'approved',
        'scheduled_at' => now(),
    ]);

    actingAs($technician);

    $response = post(route('jobs.uploadMedia', $job), [
        'collection' => 'images_before',
        'image' => UploadedFile::fake()->image('test.jpg'),
    ]);

    $response->assertStatus(403);
});

it('technician cannot save signature for approved job', function () {
    $company = Company::create(['name' => 'Cmp', 'slug' => 'cmp']);
    $technician = User::factory()->create([
        'role' => 'technician',
        'company_id' => $company->id,
    ]);

    $client = Client::create(['name' => 'Cli', 'company_id' => $company->id]);
    $template = JobTemplate::create(['name' => 'Tmp', 'company_id' => $company->id, 'structure' => []]);

    $job = Job::create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'assigned_to' => $technician->id,
        'status' => 'approved',
        'scheduled_at' => now(),
    ]);

    actingAs($technician);

    $response = post(route('jobs.saveSignature', $job), [
        'signature' => 'data:image/png;base64,fake',
    ]);

    $response->assertStatus(403);
});
