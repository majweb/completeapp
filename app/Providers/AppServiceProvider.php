<?php

namespace App\Providers;

use App\Services\SubscriptionService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configureDefaults();

        Str::macro('markdownToHtml', function ($text) {
            // Zamiana **tekst** na <strong>tekst</strong>
            $text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $text);
            // Zamiana * tekst na listę (bardzo prosta wersja)
            // Ale użytkownik prosił o pogrubienie, więc skupmy się na **
            return $text;
        });

        Inertia::share([
            'isFreeMode' => fn () => app(SubscriptionService::class)->isFreeMode(),
        ]);

        ResetPassword::toMailUsing(function ($notifiable, $token) {
            return (new MailMessage)
                ->subject('Resetowanie hasła')
                ->greeting('Witaj!')
                ->line('Otrzymujesz ten e-mail, ponieważ otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta.')
                ->action('Resetuj hasło', url(config('app.url').route('password.reset', [
                    'token' => $token,
                    'email' => $notifiable->getEmailForPasswordReset(),
                ], false)))
                ->line('Ten link do resetowania hasła wygaśnie za :count minut.', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')])
                ->line('Jeśli nie prosiłeś o zresetowanie hasła, nie musisz podejmować żadnych dalszych działań.')
                ->salutation("Pozdrawiamy,\nZespół ".config('app.name'));
        });

        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            return (new MailMessage)
                ->subject('Weryfikacja adresu e-mail')
                ->greeting('Witaj!')
                ->line('Kliknij poniższy przycisk, aby zweryfikować swój adres e-mail.')
                ->action('Zweryfikuj adres e-mail', $url)
                ->line('Jeśli nie tworzyłeś konta, nie musisz podejmować żadnych dalszych działań.')
                ->salutation("Pozdrawiamy,\nZespół ".config('app.name'));
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );


        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureRateLimiting(): void
    {
        // Rate limiting for demo login is now handled manually in DemoController
        // to provide validation error responses instead of 429 status code.
    }
}
