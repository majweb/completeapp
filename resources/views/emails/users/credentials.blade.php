<x-mail::message>
# Witaj, {{ $user->name }}!

Zostało dla Ciebie utworzone konto w systemie **{{ config('app.name') }}**.

Możesz teraz zalogować się, korzystając z poniższych danych:

**Adres email:**
{{ $user->email }}

**Hasło:**
{{ $password }}

<x-mail::button :url="config('app.url')">
Zaloguj się do systemu
</x-mail::button>

Po pierwszym zalogowaniu zalecamy zmianę hasła w ustawieniach profilu.

Dziękujemy,<br>
Zespół {{ config('app.name') }}
</x-mail::message>
