<?php

use App\Models\AuditLog;
use App\Models\Checklist;
use App\Models\Client;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Models\User;

beforeEach(function () {
    $this->company = Company::factory()->create();
    $this->user = User::factory()->create([
        'company_id' => $this->company->id,
        'role' => 'owner',
    ]);
    $this->client = Client::factory()->create([
        'company_id' => $this->company->id,
    ]);
    $this->template = JobTemplate::factory()->create([
        'company_id' => $this->company->id,
    ]);

    $this->actingAs($this->user);
});

test('saving checklist does not generate redundant job status audit log', function () {
    $job = Job::factory()->create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
        'status' => 'new',
        'started_at' => now()->subHour(),
    ]);

    $checklist = Checklist::create([
        'job_id' => $job->id,
        'content' => [['label' => 'Task 1', 'value' => false]],
    ]);

    $initialLogsCount = AuditLog::where('auditable_type', Job::class)
        ->where('auditable_id', $job->id)
        ->count();

    // Symulacja zapisu checklisty przez JobController@update
    // Front wysyła aktualny status (który może być 'new' jeśli nie było odświeżenia)
    $response = $this->put(route('jobs.update', $job), [
        'checklist_content' => [['label' => 'Task 1', 'value' => true]],
        'status' => 'new',
    ]);

    $response->assertRedirect();

    $finalLogsCount = AuditLog::where('auditable_type', Job::class)
        ->where('auditable_id', $job->id)
        ->count();

    // Bez poprawki, $finalLogsCount byłoby większe, bo status zostałby zmieniony na 'in_progress'
    expect($finalLogsCount)->toBe($initialLogsCount);
});

test('saving checklist with no changes does not generate audit log', function () {
    $job = Job::factory()->create([
        'company_id' => $this->company->id,
        'client_id' => $this->client->id,
        'template_id' => $this->template->id,
    ]);

    $checklistContent = [['label' => 'Task 1', 'value' => true]];
    $checklist = Checklist::create([
        'job_id' => $job->id,
        'content' => $checklistContent,
        'is_completed' => true,
    ]);

    $initialLogsCount = AuditLog::where('auditable_type', Checklist::class)
        ->where('auditable_id', $checklist->id)
        ->count();

    // Zapisujemy DOKŁADNIE to samo
    $response = $this->put(route('jobs.update', $job), [
        'checklist_content' => $checklistContent,
    ]);

    $response->assertRedirect();

    $finalLogsCount = AuditLog::where('auditable_type', Checklist::class)
        ->where('auditable_id', $checklist->id)
        ->count();

    expect($finalLogsCount)->toBe($initialLogsCount);
});

test('explicit status change still generates audit log', function () {
    $job = Job::factory()->create([
        'company_id' => $this->company->id,
        'status' => 'new',
    ]);

    $initialLogsCount = AuditLog::where('auditable_type', Job::class)
        ->where('auditable_id', $job->id)
        ->count();

    $this->put(route('jobs.update', $job), [
        'status' => 'in_progress',
    ]);

    $finalLogsCount = AuditLog::where('auditable_type', Job::class)
        ->where('auditable_id', $job->id)
        ->count();

    expect($finalLogsCount)->toBe($initialLogsCount + 1);
});

test('filling all checklist items updates is_completed and generates audit log', function () {
    $job = Job::factory()->create([
        'company_id' => $this->company->id,
        'status' => 'in_progress',
    ]);

    $checklist = Checklist::create([
        'job_id' => $job->id,
        'content' => [['label' => 'Task 1', 'value' => false, 'required' => true]],
        'is_completed' => false,
    ]);

    $response = $this->put(route('jobs.update', $job), [
        'checklist_content' => [['label' => 'Task 1', 'value' => true, 'required' => true]],
        'status' => 'in_progress',
    ]);

    $response->assertRedirect();

    $checklist->refresh();
    expect($checklist->is_completed)->toBeTrue();

    $log = AuditLog::where('auditable_type', Checklist::class)
        ->where('auditable_id', $checklist->id)
        ->where('event', 'updated')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->new_values)->toHaveKey('is_completed', true);
});

test('checklist creation does not generate audit log', function () {
    $job = Job::factory()->create([
        'company_id' => $this->company->id,
    ]);

    $initialLogsCount = AuditLog::where('auditable_type', Checklist::class)->count();

    Checklist::create([
        'job_id' => $job->id,
        'content' => [['label' => 'Task 1', 'value' => false]],
        'is_completed' => false,
    ]);

    $finalLogsCount = AuditLog::where('auditable_type', Checklist::class)->count();

    expect($finalLogsCount)->toBe($initialLogsCount);
});
