<?php

use App\Models\Company;
use App\Models\User;
use App\Models\Client;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Enums\JobStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('można stworzyć zlecenie z szablonu', function () {
    $company = Company::create(['name' => 'Test', 'slug' => 'test']);
    $user = User::factory()->create(['company_id' => $company->id]);
    $client = Client::create(['name' => 'Klient Testowy', 'company_id' => $company->id]);

    $template = JobTemplate::create([
        'name' => 'Przegląd Klimatyzacji',
        'company_id' => $company->id,
        'structure' => [
            ['id' => 'field_1', 'type' => 'checkbox', 'label' => 'Czy filtr wyczyszczony?'],
            ['id' => 'field_2', 'type' => 'text', 'label' => 'Uwagi technika'],
        ]
    ]);

    $this->actingAs($user);

    $job = Job::create([
        'client_id' => $client->id,
        'template_id' => $template->id,
        'status' => JobStatus::NEW,
    ]);

    expect($job->client_id)->toBe($client->id);
    expect($job->status)->toBe(JobStatus::NEW);
    expect($job->template->name)->toBe('Przegląd Klimatyzacji');
});

test('można przypisać technika do zlecenia', function () {
    $company = Company::create(['name' => 'Test', 'slug' => 'test']);
    $manager = User::factory()->create(['company_id' => $company->id, 'role' => 'manager']);
    $technician = User::factory()->create(['company_id' => $company->id, 'role' => 'technician']);
    $client = Client::create(['name' => 'Klient', 'company_id' => $company->id]);

    $job = Job::create([
        'client_id' => $client->id,
        'company_id' => $company->id,
        'status' => JobStatus::NEW,
    ]);

    $this->actingAs($manager);

    $job->update([
        'assigned_to' => $technician->id,
        'status' => JobStatus::ASSIGNED,
    ]);

    expect($job->assigned_to)->toBe($technician->id);
    expect($job->status)->toBe(JobStatus::ASSIGNED);
});

test('można wygenerować checklistę z szablonu', function () {
    $company = Company::create(['name' => 'Test', 'slug' => 'test']);
    $user = User::factory()->create(['company_id' => $company->id]);
    $client = Client::create(['name' => 'Klient', 'company_id' => $company->id]);

    $template = JobTemplate::create([
        'name' => 'Template',
        'company_id' => $company->id,
        'structure' => [
            ['id' => 'f1', 'type' => 'checkbox', 'label' => 'Label 1'],
        ]
    ]);

    $job = Job::create([
        'client_id' => $client->id,
        'template_id' => $template->id,
        'company_id' => $company->id,
    ]);

    $checklist = $template->generateChecklist($job);

    expect($checklist->job_id)->toBe($job->id);
    expect($checklist->content[0]['label'])->toBe('Label 1');
    expect(array_key_exists('value', $checklist->content[0]))->toBeTrue();
});
