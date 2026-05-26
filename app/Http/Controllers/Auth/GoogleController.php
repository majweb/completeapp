<?php
// @phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Wystąpił błąd podczas logowania przez Google.');
        }

        // Jeśli użytkownik jest już zalogowany, powiąż konto Google
        if (Auth::check()) {
            $user = Auth::user();
            $user->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken,
            ]);

            return redirect()->route('dashboard')->with('success', 'Konto Google zostało powiązane.');
        }

        $user = User::where('google_id', $googleUser->id)
            ->orWhere('email', $googleUser->email)
            ->first();

        if ($user) {
            // Update google_id and tokens if not set or changed
            $user->update([
                'google_id' => $googleUser->id,
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken,
            ]);

            Auth::login($user);

            return redirect()->intended(route('dashboard'));
        }

        // Create new user and company
        $company = Company::create([
            'name' => 'Firma ' . ($googleUser->name ?? $googleUser->email),
            'slug' => Str::slug('Firma ' . ($googleUser->name ?? $googleUser->email) . '-' . Str::random(5)),
        ]);

        $user = User::create([
            'name' => $googleUser->name ?? explode('@', $googleUser->email)[0],
            'email' => $googleUser->email,
            'google_id' => $googleUser->id,
            'google_token' => $googleUser->token,
            'google_refresh_token' => $googleUser->refreshToken,
            'password' => Hash::make(Str::random(24)),
            'company_id' => $company->id,
            'role' => 'owner',
            'is_active' => true,
            'terms_accepted_at' => now(),
            'email_verified_at' => now(),
        ]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
