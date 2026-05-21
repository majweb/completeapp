<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('owner can update company data', function () {
    $company = Company::factory()->create([
        'name' => 'Old Name',
        'address' => 'Old Address',
    ]);

    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    $response = $this->actingAs($owner)
        ->post(route('company.update'), [
            'name' => 'New Company Name',
            'address' => 'New Address 123',
            'phone' => '123456789',
            'email' => 'company@example.com',
            'vat_number' => 'PL1234567890',
            'primary_color' => '#ff0000',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('inertia.flash_data.toast', function ($toast) {
        return $toast['type'] === 'success' && $toast['message'] === 'Ustawienia firmy zostały zaktualizowane.';
    });

    $company->refresh();

    expect($company->name)->toBe('New Company Name');
    expect($company->address)->toBe('New Address 123');
    expect($company->phone)->toBe('123456789');
    expect($company->email)->toBe('company@example.com');
    expect($company->vat_number)->toBe('PL1234567890');
    expect($company->primary_color)->toBe('#ff0000');
});

test('non-owner cannot update company data', function () {
    $company = Company::factory()->create();
    $user = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'user',
    ]);

    $response = $this->actingAs($user)
        ->post(route('company.update'), [
            'name' => 'Illegal Name',
        ]);

    $response->assertStatus(403);
});

test('validation attributes are user-friendly', function () {
    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    $response = $this->actingAs($owner)
        ->from(route('company.edit'))
        ->post(route('company.update'), [
            'name' => '', // Required
            'primary_color' => 'invalid-color',
        ]);

    $response->assertRedirect(route('company.edit'));
    $response->assertSessionHasErrors(['name', 'primary_color']);

    $errors = session('errors')->getBag('default');
    expect($errors->first('name'))->toContain('nazwa firmy');
    expect($errors->first('primary_color'))->toContain('kolor główny');
});

test('can upload and remove logo', function () {
    Storage::fake('public');

    $company = Company::factory()->create();
    $owner = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'owner',
    ]);

    // 1. Upload logo
    $file = UploadedFile::fake()->image('new-logo.png');
    $this->actingAs($owner)
        ->post(route('company.update'), [
            'name' => $company->name,
            'primary_color' => '#000000',
            'logo' => $file,
        ]);

    expect($company->refresh()->getFirstMediaUrl('logo'))->not->toBeEmpty();

    // 2. Remove logo
    $this->actingAs($owner)
        ->post(route('company.update'), [
            'name' => $company->name,
            'primary_color' => '#000000',
            'remove_logo' => true,
        ]);

    expect($company->refresh()->getFirstMediaUrl('logo'))->toBeEmpty();
});
