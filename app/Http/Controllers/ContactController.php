<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function show()
    {
        $this->generateCaptcha();
        $user = auth()->user();

        return Inertia::render('contact/show', [
            'captchaText' => Session::get('contact_captcha'),
            'user' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
        ]);
    }

    public function refreshCaptcha()
    {
        $captcha = $this->generateCaptcha();
        return response()->json(['captchaText' => $captcha]);
    }

    public function send(Request $request)
    {
        $executed = RateLimiter::attempt(
            'send-contact-message:' . $request->ip(),
            $perThirtyMinutes = 1,
            function () use ($request) {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'subject' => 'required|string|in:pomysł,błąd,ocena,inne',
                    'message' => 'required|string|max:5000',
                    'captcha' => 'required|string',
                ], [], [
                    'name' => 'imię i nazwisko',
                    'email' => 'adres e-mail',
                    'subject' => 'temat wiadomości',
                    'message' => 'treść wiadomości',
                    'captcha' => 'kod weryfikacyjny',
                ]);

                if ($validated['captcha'] !== Session::get('contact_captcha')) {
                    return back()->withErrors(['captcha' => 'Kod captcha jest nieprawidłowy.']);
                }

                $adminEmail = config('mail.from.address'); // Uproszczenie, można użyć dedykowanej zmiennej

                Mail::to($adminEmail)->send(new ContactMessageMail(
                    $validated['name'],
                    $validated['email'],
                    $validated['message'],
                    $validated['subject']
                ));

                Inertia::flash('toast', [
                    'type' => 'success',
                    'message' => 'Wiadomość została wysłana. Dziękujemy za opinię!',
                ]);

                Session::forget('contact_captcha');

                return back();
            },
            decaySeconds: 1800
        );

        if (! $executed) {
            return back()->withErrors(['rate_limit' => 'Możesz wysłać tylko jedną wiadomość co 30 minut.']);
        }

        return $executed;
    }

    private function generateCaptcha(): string
    {
        $captcha = Str::random(6);
        Session::put('contact_captcha', $captcha);
        return $captcha;
    }
}
