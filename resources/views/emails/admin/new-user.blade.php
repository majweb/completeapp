<x-mail::message>
# Nowy użytkownik w systemie

Witaj Administratorze,

Nowy użytkownik właśnie zarejestrował się w aplikacji:

- **Imię i nazwisko:** {{ $user->name }}
- **Email:** {{ $user->email }}
- **Data rejestracji:** {{ $user->created_at->format('Y-m-d H:i:s') }}

<x-mail::button :url="config('app.url')">
Zarządzaj użytkownikami
</x-mail::button>

Dzięki,<br>
{{ config('app.name') }}
</x-mail::message>
