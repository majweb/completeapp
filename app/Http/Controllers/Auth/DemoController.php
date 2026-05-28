<?php

namespace App\Http\Controllers\Auth;

use App\Enums\JobStatus;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class DemoController extends Controller
{
    public function login()
    {
        if (RateLimiter::tooManyAttempts('demo:global_demo_limit', 4)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Limit przekroczony, spróbuj jutro',
            ]);

            return back();
        }

        RateLimiter::hit('demo:global_demo_limit', 86400); // 24h

        return DB::transaction(function () {
            $companyName = 'Firma Demo ' . Str::random(4);

            $company = Company::create([
                'name' => $companyName,
                'slug' => Str::slug($companyName),
                'is_demo' => true,
            ]);

            $user = User::create([
                'name' => 'Demo Owner',
                'email' => 'demo_owner_' . Str::random(8) . '@example.com',
                'password' => Hash::make(Str::random(16)),
                'company_id' => $company->id,
                'role' => 'owner',
                'is_active' => true,
                'is_demo' => true,
                'terms_accepted_at' => now(),
                'email_verified_at' => now(),
            ]);

            User::create([
                'name' => 'Demo Manager',
                'email' => 'demo_manager_' . Str::random(8) . '@example.com',
                'password' => Hash::make(Str::random(16)),
                'company_id' => $company->id,
                'role' => 'manager',
                'is_active' => true,
                'is_demo' => true,
                'terms_accepted_at' => now(),
                'email_verified_at' => now(),
            ]);

            User::create([
                'name' => 'Demo Technician',
                'email' => 'demo_tech_' . Str::random(8) . '@example.com',
                'password' => Hash::make(Str::random(16)),
                'company_id' => $company->id,
                'role' => 'technician',
                'is_active' => true,
                'is_demo' => true,
                'terms_accepted_at' => now(),
                'email_verified_at' => now(),
            ]);

            $this->seedDemoData($company, $user);

            Auth::login($user);

            return redirect()->route('dashboard')->with('success', 'Witaj w wersji demonstracyjnej!');
        });
    }

    private function seedDemoData(Company $company, User $user)
    {
        // Create a job template
        $template = JobTemplate::create([
            'company_id' => $company->id,
            'name' => 'Przegląd klimatyzacji',
            'description' => 'Standardowy przegląd okresowy jednostki wewnętrznej i zewnętrznej.',
            'category' => 'Serwis',
            'structure' => [
                ['id' => Str::uuid(), 'label' => 'Czyszczenie filtrów', 'type' => 'checkbox', 'required' => true],
                ['id' => Str::uuid(), 'label' => 'Odgrzybianie parownika', 'type' => 'checkbox', 'required' => true],
                ['id' => Str::uuid(), 'label' => 'Pomiar ciśnienia czynnika', 'type' => 'text', 'required' => false],
                ['id' => Str::uuid(), 'label' => 'Temperatura nawiewu', 'type' => 'number', 'required' => true],
            ],
            'require_photo_before' => true,
            'require_photo_after' => true,
            'require_signature' => true,
            'is_active' => true,
        ]);

        $clients = [
            ['name' => 'Jan Kowalski', 'address' => 'ul. Wiejska 1, Warszawa', 'lat' => 52.2297, 'lng' => 21.0122],
            ['name' => 'Anna Nowak', 'address' => 'ul. Marszałkowska 10, Warszawa', 'lat' => 52.2322, 'lng' => 21.0083],
            ['name' => 'Piotr Wiśniewski', 'address' => 'ul. Chmielna 5, Warszawa', 'lat' => 52.2311, 'lng' => 21.0111],
        ];

        foreach ($clients as $cData) {
            $client = Client::create([
                'company_id' => $company->id,
                'name' => $cData['name'],
                'address' => $cData['address'],
                'latitude' => $cData['lat'],
                'longitude' => $cData['lng'],
                'email' => Str::slug($cData['name']) . '@example.com',
            ]);

            // Create some jobs
            $job1 = Job::create([
                'company_id' => $company->id,
                'client_id' => $client->id,
                'assigned_to' => $user->id,
                'template_id' => $template->id,
                'status' => JobStatus::NEW,
                'scheduled_at' => now()->addDays(rand(1, 5)),
            ]);
            $template->generateChecklist($job1);

            $job2 = Job::create([
                'company_id' => $company->id,
                'client_id' => $client->id,
                'assigned_to' => $user->id,
                'template_id' => $template->id,
                'status' => JobStatus::COMPLETED,
                'scheduled_at' => now()->subDays(rand(1, 5)),
                'completed_at' => now()->subDays(rand(0, 1)),
            ]);
            $checklist = $template->generateChecklist($job2);

            // Mark checklist as completed for finished jobs
            $checklist->update([
                'is_completed' => true,
                'content' => collect($checklist->content)->map(function ($item) {
                    if ($item['type'] === 'checkbox') $item['value'] = true;
                    if ($item['type'] === 'text') $item['value'] = 'Prawidłowe';
                    if ($item['type'] === 'number') $item['value'] = 22;
                    return $item;
                })->toArray()
            ]);
        }
    }
}
