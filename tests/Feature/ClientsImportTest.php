<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Company;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\UploadedFile;
use App\Imports\ClientsImport;

beforeEach(function () {
    $this->company = Company::factory()->create();
    $this->user = User::factory()->create([
        'company_id' => $this->company->id,
        'role' => 'owner',
    ]);
});

test('user can import clients from excel', function () {
    Excel::fake();

    $file = UploadedFile::fake()->create('clients.xlsx');

    $response = $this->actingAs($this->user)
        ->post(route('clients.import'), [
            'file' => $file,
        ]);

    $response->assertRedirect(route('clients.index'));
    Excel::assertImported('clients.xlsx', function (ClientsImport $import) {
        return true;
    });
});

test('clients are actually created in database during import', function () {
    // We don't fake Excel here because we want to test the actual integration
    // But we need a real CSV/Excel content
    $content = "nazwa,email,telefon,adres,notatki\n";
    $content .= "Jan Kowalski,jan@example.com,123456789,Warszawa,Testowy klient\n";
    $content .= "Anna Nowak,anna@example.com,987654321,Kraków,Inna notatka\n";

    $file = UploadedFile::fake()->createWithContent('clients.csv', $content);

    $response = $this->actingAs($this->user)
        ->post(route('clients.import'), [
            'file' => $file,
        ]);

    $response->assertRedirect(route('clients.index'));

    $this->assertDatabaseHas('clients', [
        'name' => 'Jan Kowalski',
        'email' => 'jan@example.com',
        'company_id' => $this->company->id,
    ]);

    $this->assertDatabaseHas('clients', [
        'name' => 'Anna Nowak',
        'email' => 'anna@example.com',
        'company_id' => $this->company->id,
    ]);
});

test('import validates required fields', function () {
    $content = "nazwa,email\n";
    $content .= ",brak-emaila\n"; // Missing name, invalid email

    $file = UploadedFile::fake()->createWithContent('invalid_clients.csv', $content);

    $response = $this->actingAs($this->user)
        ->post(route('clients.import'), [
            'file' => $file,
        ]);

    $response->assertRedirect(route('clients.index'));

    // Database should be empty for this company
    expect(Client::where('company_id', $this->company->id)->count())->toBe(0);
});

test('user can download clients template', function () {
    $response = $this->actingAs($this->user)
        ->get(route('clients.template'));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $response->assertHeader('Content-Disposition', 'attachment; filename=klienci_wzor.csv');
});
