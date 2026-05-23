<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            JobTemplateSeeder::class,
            AdminUserSeeder::class,
        ]);

//        $company = \App\Models\Company::where('slug', 'default-company')->first();
//
//        if (!User::where('email', 'test@example.com')->exists()) {
//            User::factory()->create([
//                'name' => 'Test User',
//                'email' => 'test@example.com',
//                'company_id' => $company->id,
//                'role' => 'owner',
//            ]);
//        }
    }
}
