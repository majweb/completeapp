<?php
use App\Models\User;
use App\Models\Company;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('google login is accessible for guests', function () {
    $response = $this->get(route('auth.google'));
    $response->assertRedirect(); // Should redirect to Google
});

test('authenticated user can link google account', function () {
    $user = User::factory()->create(['role' => 'owner', 'google_id' => null]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->id = 'google-id-123';
    $socialiteUser->token = 'google-token';
    $socialiteUser->refreshToken = 'google-refresh-token';
    $socialiteUser->name = 'Google User';
    $socialiteUser->email = $user->email;

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->actingAs($user)->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success', 'Konto Google zostało powiązane.');

    $user->refresh();
    expect($user->google_id)->toBe('google-id-123');
});

test('guest can register via google and gets owner role', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->id = 'google-new-id';
    $socialiteUser->token = 'new-token';
    $socialiteUser->refreshToken = 'new-refresh-token';
    $socialiteUser->name = 'New Google User';
    $socialiteUser->email = 'new@example.com';

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard'));

    $user = User::where('email', 'new@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('owner')
        ->and($user->google_id)->toBe('google-new-id');
});
