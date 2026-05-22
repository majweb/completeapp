<?php

use App\Models\User;
use App\Models\Company;
use App\Models\JobTemplate;
use App\Models\Job;
use App\Models\Client;

test('it creates a new version when updating a template that is in use', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    $client = Client::factory()->create(['company_id' => $company->id]);

    $template = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Original Template',
        'is_active' => true,
    ]);

    // Create a job using this template
    Job::factory()->create([
        'company_id' => $company->id,
        'template_id' => $template->id,
        'client_id' => $client->id,
    ]);

    $newData = [
        'name' => 'Updated Template',
        'description' => 'New Description',
        'structure' => [['id' => '1', 'label' => 'Test', 'type' => 'checkbox', 'required' => false]],
        'require_photo_before' => false,
        'require_photo_after' => false,
        'require_signature' => false,
        'version' => '2.0',
    ];

    $response = $this->actingAs($owner)
        ->put(route('job-templates.update', $template), $newData);

    $response->assertRedirect(route('job-templates.index'));

    // Original template should be inactive
    $template->refresh();
    expect($template->is_active)->toBeFalse();

    // New template should be created and active
    $newTemplate = JobTemplate::where('name', 'Updated Template')->first();
    expect($newTemplate)->not->toBeNull();
    expect($newTemplate->is_active)->toBeTrue();
    expect($newTemplate->original_id)->toBe($template->id);
});

test('it updates the template directly if it is not in use', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    $template = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Unused Template',
        'is_active' => true,
    ]);

    $newData = [
        'name' => 'Updated Unused Template',
        'description' => 'New Description',
        'structure' => [['id' => '1', 'label' => 'Test', 'type' => 'checkbox', 'required' => false]],
        'require_photo_before' => false,
        'require_photo_after' => false,
        'require_signature' => false,
        'version' => '2.0',
    ];

    $response = $this->actingAs($owner)
        ->put(route('job-templates.update', $template), $newData);

    $template->refresh();
    expect($template->name)->toBe('Updated Unused Template');
    expect($template->is_active)->toBeTrue();

    // No new record should be created
    expect(JobTemplate::count())->toBe(1);
});
