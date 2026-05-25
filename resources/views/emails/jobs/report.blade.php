<x-mail::message>
# Raport zlecenia #{{ $job->id }}

Witaj,

Przesyłamy raport z wykonanego zlecenia: **{{ $job->template->name ?? 'Zlecenie' }}**.

**Szczegóły:**
- **Klient:** {{ $job->client->name }}
- **Data wykonania:** {{ $job->completed_at ? $job->completed_at->format('d.m.Y H:i') : '-' }}

Pełny raport w formacie PDF znajduje się w załączniku do tej wiadomości.
Możesz również zobaczyć szczegóły zlecenia i zdjęcia online, klikając w poniższy przycisk:

<x-mail::button :url="route('public.job.show', $job->uuid)">
Zobacz zlecenie online
</x-mail::button>

Dziękujemy za współpracę,<br>
Zespół {{ $job->company->name ?? config('app.name') }}
</x-mail::message>
