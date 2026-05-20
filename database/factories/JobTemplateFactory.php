<?php

namespace Database\Factories;

use App\Models\JobTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobTemplate>
 */
class JobTemplateFactory extends Factory
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
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence,
            'structure' => [
                ['id' => 'field_1', 'label' => 'Pole 1', 'type' => 'text', 'required' => true],
                ['id' => 'field_2', 'label' => 'Pole 2', 'type' => 'checkbox', 'required' => false],
            ],
            'version' => 1.0,
        ];
    }
}
