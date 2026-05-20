<?php

use App\Models\Company;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $this->user = User::factory()->create(['company_id' => $this->company->id, 'role' => 'owner']);
    $this->actingAs($this->user);
});

test('can list job templates', function () {
    JobTemplate::create([
        'name' => 'Template 1',
        'company_id' => $this->company->id,
        'structure' => [['id' => '1', 'label' => 'Task', 'type' => 'checkbox', 'required' => true]],
        'version' => '1.0',
    ]);

    $response = $this->get(route('job-templates.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('job-templates/index', true)
        ->has('templates', 1)
    );
});

test('can create job template', function () {
    $response = $this->post(route('job-templates.store'), [
        'name' => 'New Template',
        'description' => 'Test Description',
        'version' => '1.0',
        'structure' => [
            ['id' => 'f1', 'label' => 'Field 1', 'type' => 'checkbox', 'required' => true]
        ],
    ]);

    $response->assertRedirect(route('job-templates.index'));
    expect(JobTemplate::where('name', 'New Template')->exists())->toBeTrue();
});

test('can update job template', function () {
    $template = JobTemplate::create([
        'name' => 'Old Name',
        'company_id' => $this->company->id,
        'structure' => [['id' => '1', 'label' => 'Task', 'type' => 'checkbox', 'required' => true]],
        'version' => '1.0',
    ]);

    $response = $this->put(route('job-templates.update', $template), [
        'name' => 'Updated Name',
        'version' => '1.1',
        'structure' => [['id' => '1', 'label' => 'Updated Task', 'type' => 'text', 'required' => false]],
    ]);

    $response->assertRedirect(route('job-templates.index'));
    expect($template->fresh()->name)->toBe('Updated Name');
    expect((string) $template->fresh()->version)->toBe('1.1');
});

test('can delete unused job template', function () {
    $template = JobTemplate::create([
        'name' => 'To Delete',
        'company_id' => $this->company->id,
        'structure' => [['id' => '1', 'label' => 'Task', 'type' => 'checkbox', 'required' => true]],
        'version' => '1.0',
    ]);

    $response = $this->delete(route('job-templates.destroy', $template));

    $response->assertRedirect(route('job-templates.index'));
    expect(JobTemplate::find($template->id))->toBeNull();
});
