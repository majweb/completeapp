<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => \App\Models\Company::factory(),
            'client_id' => \App\Models\Client::factory(),
            'template_id' => \App\Models\JobTemplate::factory(),
            'assigned_to' => \App\Models\User::factory(),
            'status' => \App\Enums\JobStatus::NEW,
            'scheduled_at' => now()->addDays(1),
        ];
    }
}
