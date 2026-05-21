<?php

use App\Models\Job;
use App\Models\Company;
use App\Models\Client;
use App\Models\JobTemplate;
use App\Models\User;
use App\Models\Checklist;
use App\Services\AIService;
use Illuminate\Support\Facades\Http;

test('it generates mock summary when api key is missing', function () {
    $company = Company::factory()->create();
    $client = Client::factory()->create(['company_id' => $company->id]);
    $template = JobTemplate::factory()->create(['company_id' => $company->id]);
    $user = User::factory()->create(['company_id' => $company->id]);

    $job = Job::factory()->create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
        'assigned_to' => $user->id,
    ]);

    Checklist::create([
        'job_id' => $job->id,
        'content' => [
            ['id' => '1', 'label' => 'Test Item', 'type' => 'checkbox', 'value' => true]
        ]
    ]);

    // Ensure config is empty for this test
    config(['services.openai.key' => '', 'services.openai.enabled' => true]);

    $service = new AIService();
    $summary = $service->generateJobSummary($job);

    expect($summary)->toContain('Przykładowe podsumowanie (MOCK)')
        ->and($summary)->toContain($template->name)
        ->and($summary)->toContain($client->name);
});

test('it returns disabled message when ai is disabled', function () {
    $company = Company::factory()->create();
    $job = Job::factory()->create(['company_id' => $company->id]);

    config(['services.openai.enabled' => false]);

    $service = new AIService();
    $summary = $service->generateJobSummary($job);

    expect($summary)->toBe('Funkcja AI jest wyłączona w konfiguracji systemowej.');
});

test('it calls openai api when key is present', function () {
    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => 'AI Generated Summary'
                    ]
                ]
            ]
        ], 200)
    ]);

    $company = Company::factory()->create();
    $client = Client::factory()->create(['company_id' => $company->id]);
    $template = JobTemplate::factory()->create(['company_id' => $company->id]);

    $job = Job::factory()->create([
        'company_id' => $company->id,
        'client_id' => $client->id,
        'template_id' => $template->id,
    ]);

    config(['services.openai.key' => 'test-key', 'services.openai.enabled' => true]);

    $service = new AIService();
    $summary = $service->generateJobSummary($job);

    expect($summary)->toBe('AI Generated Summary');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.openai.com/v1/chat/completions' &&
               $request->header('Authorization')[0] === 'Bearer test-key';
    });
});
