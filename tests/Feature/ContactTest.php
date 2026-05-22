<?php

use App\Models\User;
use App\Models\Company;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Session;

beforeEach(function () {
    $this->company = Company::create(['name' => 'Test Company', 'slug' => 'test-company']);
    $this->user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
        'company_id' => $this->company->id,
        'role' => 'owner',
    ]);
});

test('contact page is accessible', function () {
    $response = $this->actingAs($this->user)
        ->get(route('contact.show'));

    $response->assertStatus(200);
});

test('contact message can be sent with valid captcha', function () {
    Mail::fake();
    Session::put('contact_captcha', 'ABCD12');

    $response = $this->actingAs($this->user)
        ->post(route('contact.send'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'pomysł',
            'message' => 'To jest testowa wiadomość.',
            'captcha' => 'ABCD12',
        ]);

    $response->assertRedirect();
    Mail::assertSent(ContactMessageMail::class);
});

test('contact message cannot be sent with invalid captcha', function () {
    Mail::fake();
    Session::put('contact_captcha', 'ABCD12');

    $response = $this->actingAs($this->user)
        ->from(route('contact.show'))
        ->post(route('contact.send'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'pomysł',
            'message' => 'To jest testowa wiadomość.',
            'captcha' => 'WRONG',
        ]);

    $response->assertRedirect(route('contact.show'));
    $response->assertSessionHasErrors('captcha');
    Mail::assertNotSent(ContactMessageMail::class);
});

test('contact message sending is rate limited', function () {
    Mail::fake();
    Session::put('contact_captcha', 'ABCD12');

    // Pierwsza próba - powinna się udać
    $this->actingAs($this->user)
        ->post(route('contact.send'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'pomysł',
            'message' => 'Pierwsza wiadomość.',
            'captcha' => 'ABCD12',
        ]);

    // Druga próba natychmiast po pierwszej - powinna zostać zablokowana
    Session::put('contact_captcha', 'EFGH34');
    $response = $this->actingAs($this->user)
        ->from(route('contact.show'))
        ->post(route('contact.send'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'pomysł',
            'message' => 'Druga wiadomość.',
            'captcha' => 'EFGH34',
        ]);

    $response->assertRedirect(route('contact.show'));
    $response->assertSessionHasErrors('rate_limit');
    expect(session('errors')->get('rate_limit')[0])->toContain('30 minut');
});

test('captcha can be refreshed via ajax', function () {
    Session::put('contact_captcha', 'OLD123');

    $response = $this->actingAs($this->user)
        ->get(route('contact.captcha-refresh'));

    $response->assertStatus(200)
        ->assertJsonStructure(['captchaText']);

    $newCaptcha = $response->json('captchaText');
    expect($newCaptcha)->not->toBe('OLD123');
    expect(Session::get('contact_captcha'))->toBe($newCaptcha);
});
