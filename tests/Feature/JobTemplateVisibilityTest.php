<?php

use App\Models\User;
use App\Models\Company;
use App\Models\JobTemplate;
use App\Models\Job;
use App\Models\Client;
use Inertia\Testing\AssertableInertia as Assert;

test('only active templates are shown when creating a job', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    // Aktywny szablon
    $activeTemplate = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Active Template',
        'is_active' => true,
    ]);

    // Nieaktywny szablon
    $inactiveTemplate = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Inactive Template',
        'is_active' => false,
    ]);

    $response = $this->actingAs($owner)
        ->get(route('jobs.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('jobs/create')
        ->has('templates', 1)
        ->where('templates.0.id', $activeTemplate->id)
    );
});

test('index only shows active company templates but shows all active global templates', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    // Aktywny szablon firmy
    $activeCompanyTemplate = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Active Company Template',
        'is_active' => true,
    ]);

    // Nieaktywny szablon firmy
    $inactiveCompanyTemplate = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Inactive Company Template',
        'is_active' => false,
    ]);

    // Aktywny szablon globalny
    $activeGlobalTemplate = JobTemplate::factory()->create([
        'company_id' => null,
        'name' => 'Active Global Template',
        'is_active' => true,
        'category' => 'Test'
    ]);

    $response = $this->actingAs($owner)
        ->get(route('job-templates.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('job-templates/index')
        ->has('myTemplates', 1)
        ->where('myTemplates.0.id', $activeCompanyTemplate->id)
        ->has('globalTemplates.Test', 1)
    );
});

test('global templates already imported are not shown in global list', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    // Szablon globalny
    $globalTemplate = JobTemplate::factory()->create([
        'company_id' => null,
        'name' => 'Global Template',
        'is_active' => true,
        'category' => 'Test'
    ]);

    // Zaimportowany szablon
    $importedTemplate = JobTemplate::factory()->create([
        'company_id' => $company->id,
        'name' => 'Imported Template',
        'original_id' => $globalTemplate->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($owner)
        ->get(route('job-templates.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('job-templates/index')
        ->has('myTemplates', 1)
        ->where('myTemplates.0.id', $importedTemplate->id)
        ->has('globalTemplates', 0) // Nie powinno być kategorii 'Test' z tym szablonem
    );
});
