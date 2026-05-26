<x-mail::message>
# Test Wysyłki Maila

To jest testowa wiadomość wysłana z Twojej aplikacji Laravel.

<x-mail::button :url="config('app.url')">
Wróć do aplikacji
</x-mail::button>

Dzięki,<br>
{{ config('app.name') }}
</x-mail::message>
