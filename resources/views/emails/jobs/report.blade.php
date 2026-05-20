<x-mail::message>
# Raport zlecenia #{{ $job->id }}

Witaj,

Przesyłamy raport z wykonanego zlecenia: **{{ $job->template->name ?? 'Zlecenie' }}**.

**Szczegóły:**
- **Klient:** {{ $job->client->name }}
- **Data wykonania:** {{ $job->completed_at?->format('d.m.Y H:i') }}

Pełny raport w formacie PDF znajduje się w załączniku do tej wiadomości.

Dziękujemy za współpracę,<br>
Zespół {{ $job->company->name ?? config('app.name') }}
</x-mail::message>
