<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JobTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company = \App\Models\Company::firstOrCreate(
            ['slug' => 'default-company'],
            ['name' => 'Firma Testowa']
        );

        $templates = [
            [
                'name' => 'Przegląd klimatyzacji',
                'description' => 'Standardowy przegląd okresowy jednostki klimatyzacyjnej.',
                'structure' => [
                    ['id' => 'clean_filter', 'label' => 'Czyszczenie filtrów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'check_refrigerant', 'label' => 'Sprawdzenie poziomu czynnika', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'pressure_reading', 'label' => 'Odczyt ciśnienia (bar)', 'type' => 'number', 'required' => false],
                    ['id' => 'notes', 'label' => 'Uwagi technika', 'type' => 'text', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Naprawa elektryczna',
                'description' => 'Diagnostyka i naprawa usterek instalacji elektrycznej.',
                'structure' => [
                    ['id' => 'safety_check', 'label' => 'Pomiary ochronne wykonane', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'replaced_parts', 'label' => 'Wymienione części', 'type' => 'text', 'required' => false],
                    ['id' => 'final_test', 'label' => 'Test końcowy sprawności', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
        ];

        foreach ($templates as $templateData) {
            \App\Models\JobTemplate::updateOrCreate(
                ['name' => $templateData['name'], 'company_id' => $company->id],
                $templateData
            );
        }
    }
}
