<?php

use App\Enums\JobStatus;
use App\Models\Client;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $this->user = User::factory()->create(['company_id' => $this->company->id, 'role' => 'owner']);
    $this->actingAs($this->user);

    $this->client = Client::create(['name' => 'Test Client', 'company_id' => $this->company->id]);
    $this->template = JobTemplate::create([
        'name' => 'Test Template',
        'company_id' => $this->company->id,
        'structure' => [
            ['id' => 'item_1', 'label' => 'Task 1', 'type' => 'checkbox', 'required' => true],
        ],
    ]);
});

test('can list jobs', function () {
    Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $response = $this->get(route('jobs.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('jobs/index', true)
        ->has('jobs.data', 1)
    );
});

test('can create job and generates checklist', function () {
    $response = $this->post(route('jobs.store'), [
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'scheduled_at' => now()->addDay()->format('Y-m-d'),
    ]);

    $response->assertRedirect(route('jobs.index'));
    $response->assertSessionHas('inertia.flash_data', fn ($data) => $data['toast']['message'] === 'Zlecenie zostało utworzone.');

    $job = Job::first();
    expect($job->client_id)->toBe($this->client->id);
    expect($job->checklist)->not->toBeNull();
    expect($job->checklist->content)->toHaveCount(1);
});

test('can show job details', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);
    $this->template->generateChecklist($job);

    $response = $this->get(route('jobs.show', $job));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('jobs/show', true)
        ->has('job.checklist')
    );
});

test('can upload media to job', function () {
    Storage::fake('public');
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $file = UploadedFile::fake()->image('before.jpg');

    $response = $this->post(route('jobs.uploadMedia', $job), [
        'image' => $file,
        'collection' => 'images_before',
    ]);

    $response->assertRedirect();
    expect($job->getMedia('images_before'))->toHaveCount(1);
});

test('can save signature to job', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    $response = $this->post(route('jobs.saveSignature', $job), [
        'signature' => $signatureData,
    ]);

    $response->assertRedirect();
    expect($job->getMedia('signature'))->toHaveCount(1);
});

test('can download job report', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::COMPLETED,
        'scheduled_at' => now(),
        'started_at' => now()->subHour(),
    ]);
    $job->checklist()->create(['content' => []]);

    $response = $this->get(route('jobs.report', $job));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
});

test('can delete media from job', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $file = UploadedFile::fake()->image('photo.jpg');
    $media = $job->addMedia($file)->toMediaCollection('images_before');

    $response = $this->delete(route('jobs.deleteMedia', [$job, $media]));

    $response->assertRedirect();
    expect($job->getMedia('images_before'))->toHaveCount(0);
});

test('can reorder media in job', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $file1 = UploadedFile::fake()->image('photo1.jpg');
    $file2 = UploadedFile::fake()->image('photo2.jpg');

    $m1 = $job->addMedia($file1)->toMediaCollection('images_before');
    $m2 = $job->addMedia($file2)->toMediaCollection('images_before');

    $response = $this->post(route('jobs.reorderMedia', $job), [
        'media_ids' => [$m2->id, $m1->id],
    ]);

    $response->assertRedirect();

    // Refresh media
    $media = $job->fresh()->getMedia('images_before');
    expect($media[0]->id)->toBe($m2->id);
});

test('can send job report', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::COMPLETED,
        'scheduled_at' => now(),
        'started_at' => now()->subHour(),
    ]);
    $job->checklist()->create(['content' => []]);

    $response = $this->post(route('jobs.sendReport', $job));

    $response->assertRedirect();
    $response->assertSessionHas('inertia.flash_data', fn ($data) => str_contains($data['toast']['message'], 'Raport został wysłany') || str_contains($data['toast']['message'], 'Klient nie posiada adresu email'));
});

test('cannot see jobs from another company', function () {
    $otherCompany = Company::create(['name' => 'Other Company', 'slug' => 'other-company']);
    $otherClient = Client::create(['name' => 'Other Client', 'company_id' => $otherCompany->id]);
    $otherJob = Job::create([
        'company_id' => $otherCompany->id,
        'client_id' => $otherClient->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::NEW,
        'scheduled_at' => now(),
    ]);

    $response = $this->get(route('jobs.index'));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('jobs/index', true)
        ->has('jobs.data', 0)
    );

    $response = $this->get(route('jobs.show', $otherJob));
    $response->assertStatus(404);
});

test('can duplicate job', function () {
    $job = Job::create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'assigned_to' => $this->user->id,
        'status' => JobStatus::COMPLETED,
        'scheduled_at' => now()->subDay(),
    ]);

    $response = $this->post(route('jobs.duplicate', $job));

    $response->assertRedirect(route('jobs.index'));
    $response->assertSessionHas('inertia.flash_data', fn ($data) => $data['toast']['message'] === 'Zlecenie zostało zduplikowane.');

    $newJob = Job::where('id', '!=', $job->id)->first();
    expect($newJob->client_id)->toBe($job->client_id);
    expect($newJob->template_id)->toBe($job->template_id);
    expect($newJob->assigned_to)->toBe($job->assigned_to);
    expect($newJob->status)->toBe(JobStatus::NEW);
    expect($newJob->checklist)->not->toBeNull();
    expect($newJob->auditLogs)->toHaveCount(0);
});
