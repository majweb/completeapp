<?php

use App\Models\User;
use App\Models\Company;
use App\Models\Client;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('owner can import clients from csv', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    $csvContent = "name,email,phone,address,notes\n";
    $csvContent .= "John Doe,john@example.com,123456789,Street 1,Note 1\n";
    $csvContent .= "Jane Smith,jane@example.com,987654321,Street 2,Note 2\n";

    $file = UploadedFile::fake()->createWithContent('clients.csv', $csvContent)->mimeType('text/csv');

    $response = $this->actingAs($owner)
        ->post(route('clients.import'), [
            'file' => $file,
        ]);

    $response->assertRedirect(route('clients.index'));

    $this->assertDatabaseHas('clients', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'company_id' => $company->id,
    ]);

    $this->assertDatabaseHas('clients', [
        'name' => 'Jane Smith',
        'email' => 'jane@example.com',
        'company_id' => $company->id,
    ]);
});

test('technician cannot import clients', function () {
    $company = Company::factory()->create();
    $technician = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'technician',
    ]);

    $file = UploadedFile::fake()->create('clients.csv', 100);

    $response = $this->actingAs($technician)
        ->post(route('clients.import'), [
            'file' => $file,
        ]);

    $response->assertForbidden();
});
