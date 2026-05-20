<?php

use App\Models\User;
use App\Models\Company;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

test('user avatar_url falls back to company logo', function () {
    Storage::fake('public');

    $company = Company::factory()->create();
    $user = User::factory()->create([
        'company_id' => $company->id,
        'avatar' => null,
    ]);

    // Mock logo in media library
    $company->addMedia(UploadedFile::fake()->image('logo.jpg'))
        ->toMediaCollection('logo');

    $avatarUrl = $user->avatar_url;

    expect($avatarUrl)->not->toBeNull();
    expect($avatarUrl)->toContain('logo.jpg');
});

test('user avatar_url uses user avatar if available', function () {
    Storage::fake('public');

    $company = Company::factory()->create();
    $user = User::factory()->create([
        'company_id' => $company->id,
        'avatar' => 'avatars/my-avatar.jpg',
    ]);

    // Mock logo in media library
    $company->addMedia(UploadedFile::fake()->image('logo.jpg'))
        ->toMediaCollection('logo');

    $avatarUrl = $user->avatar_url;

    expect($avatarUrl)->not->toBeNull();
    expect($avatarUrl)->toContain('avatars/my-avatar.jpg');
    expect($avatarUrl)->not->toContain('logo.jpg');
});
