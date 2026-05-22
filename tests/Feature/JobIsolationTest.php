<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Job;
use App\Models\User;
use App\Models\Client;
use App\Models\JobTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_technician_can_only_see_their_assigned_jobs_in_index()
    {
        $company = Company::factory()->create();
        $technician1 = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'technician',
        ]);
        $technician2 = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'technician',
        ]);

        $client = Client::factory()->create(['company_id' => $company->id]);
        $template = JobTemplate::factory()->create(['company_id' => $company->id]);

        $job1 = Job::factory()->create([
            'company_id' => $company->id,
            'assigned_to' => $technician1->id,
            'client_id' => $client->id,
            'template_id' => $template->id,
        ]);

        $job2 = Job::factory()->create([
            'company_id' => $company->id,
            'assigned_to' => $technician2->id,
            'client_id' => $client->id,
            'template_id' => $template->id,
        ]);

        // Login as technician 1
        $this->actingAs($technician1);

        $response = $this->get(route('jobs.index'));

        $response->assertStatus(200);

        // Should see job 1 but not job 2
        $jobs = $response->viewData('page')['props']['jobs'];
        $this->assertCount(1, $jobs);
        $this->assertEquals($job1->id, $jobs[0]['id']);

        $ids = collect($jobs)->pluck('id');
        $this->assertFalse($ids->contains($job2->id));
    }

    public function test_owner_can_see_all_company_jobs()
    {
        $company = Company::factory()->create();
        $owner = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'owner',
        ]);
        $technician = User::factory()->create([
            'company_id' => $company->id,
            'role' => 'technician',
        ]);

        $client = Client::factory()->create(['company_id' => $company->id]);
        $template = JobTemplate::factory()->create(['company_id' => $company->id]);

        Job::factory()->count(3)->create([
            'company_id' => $company->id,
            'assigned_to' => $technician->id,
            'client_id' => $client->id,
            'template_id' => $template->id,
        ]);

        $this->actingAs($owner);

        $response = $this->get(route('jobs.index'));

        $response->assertStatus(200);
        $jobs = $response->viewData('page')['props']['jobs'];
        $this->assertCount(3, $jobs);
    }
}
