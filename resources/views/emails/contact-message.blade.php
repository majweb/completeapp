<x-mail::message>
# Nowa wiadomość z formularza kontaktowego

**Od:** {{ $name }} ({{ $email }})
**Temat:** {{ $subjectType }}

**Wiadomość:**
{{ $messageContent }}

<x-mail::button :url="config('app.url')">
Przejdź do aplikacji
</x-mail::button>

Dzięki,<br>
{{ config('app.name') }}
</x-mail::message>
