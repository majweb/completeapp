<x-mail::message>
# Dzień dobry {{ $job->client->name }},

Prosimy o zapoznanie się z podsumowaniem zlecenia **#{{ $job->id }}** i złożenie podpisu potwierdzającego wykonanie prac.

Możesz to zrobić klikając w poniższy przycisk (link jest ważny przez 24 godziny):

<x-mail::button :url="$url">
Przejdź do podpisu
</x-mail::button>

Dziękujemy,<br>
Zespół {{ $job->company->name ?? config('app.name') }}
</x-mail::message>
