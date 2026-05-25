<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Raport Zlecenia #{{ $job->id }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; line-height: 1.5; }
        .header { border-bottom: 2px solid {{ $job->company->primary_color ?? '#3b82f6' }}; padding-bottom: 10px; margin-bottom: 20px; }
        .company-logo { float: right; max-height: 80px; max-width: 200px; }
        .company-name { font-size: 20px; font-weight: bold; color: {{ $job->company->primary_color ?? '#1e40af' }}; }
        .report-title { font-size: 18px; margin-top: 10px; }
        .section { margin-bottom: 30px; clear: both; }
        .section-header { page-break-after: avoid; margin-bottom: 10px; }
        .section-title { font-size: 14px; font-weight: bold; background: #f3f4f6; padding: 5px; border-left: 4px solid {{ $job->company->primary_color ?? '#3b82f6' }}; width: 100%; display: block; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid td { padding: 5px; vertical-align: top; }
        .label { color: #6b7280; font-size: 10px; text-transform: uppercase; }
        .value { font-weight: bold; }
        .checklist-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; page-break-inside: avoid; }
        .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #333; margin-right: 5px; text-align: center; line-height: 10px; }
        .checked { background: {{ $job->company->primary_color ?? '#3b82f6' }}; color: white; border-color: {{ $job->company->primary_color ?? '#3b82f6' }}; }
        .photo-grid { margin-top: 10px; width: 100%; }
        .photo { width: 45%; margin: 1.5%; margin-bottom: 10px; display: inline-block; border: 1px solid #ddd; padding: 2px; page-break-inside: avoid; vertical-align: top; }
        .photo img { width: 100%; height: 220px; object-fit: cover; background: #f9fafb; }
        .clear { clear: both; }
        .signature-box { margin-top: 30px; text-align: right; }
        .signature-image { max-width: 200px; border-bottom: 1px solid #333; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        @if($job->company->getFirstMedia('logo'))
            <img src="data:image/{{ $job->company->getFirstMedia('logo')->extension }};base64,{{ base64_encode(file_get_contents($job->company->getFirstMedia('logo')->getPath())) }}" class="company-logo">
        @endif
        <div class="company-name">{{ $job->company->name }}</div>
        <div class="report-title">RAPORT ZE ZLECENIA #{{ $job->id }}</div>
        <div style="font-size: 10px; color: #6b7280;">Data wygenerowania: {{ now()->format('d.m.Y H:i') }}</div>
    </div>

    <div class="section">
        <table class="grid">
            <tr>
                <td width="50%">
                    <div class="label">WYKONAWCA</div>
                    <div class="value">{{ $job->company->name }}</div>
                    <div style="font-size: 11px;">{{ $job->company->address }}</div>
                    @if($job->company->vat_number)
                        <div style="font-size: 11px;">NIP: {{ $job->company->vat_number }}</div>
                    @endif
                    @if($job->company->phone)
                        <div style="font-size: 11px;">Tel: {{ $job->company->phone }}</div>
                    @endif
                    @if($job->company->email)
                        <div style="font-size: 11px;">Email: {{ $job->company->email }}</div>
                    @endif
                </td>
                <td width="50%">
                    <div class="label">KLIENT</div>
                    <div class="value">{{ $job->client->name }}</div>
                    <div style="font-size: 11px;">{{ $job->client->address }}</div>
                    <div style="font-size: 11px;">Tel: {{ $job->client->phone }}</div>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="padding-top: 15px;">
                    <div class="label">INFORMACJE O ZLECENIU</div>
                    <div class="value">{{ $job->template->name }}</div>
                    <table width="100%">
                        <tr>
                            <td>Status: {{ $job->status->label() }}</td>
                            <td>Data wykonania: {{ $job->scheduled_at->format('d.m.Y') }}</td>
                            <td>Technik: {{ $job->technician->name }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <div class="section" style="page-break-inside: avoid;">
        <div class="section-header">
            <div class="section-title">CHECKLISTA</div>
        </div>
        <div>
            @foreach($job->checklist->content as $item)
                <div class="checklist-item">
                    @if($item['type'] === 'checkbox')
                        <span class="checkbox {{ $item['value'] ? 'checked' : '' }}">
                            {!! $item['value'] ? '✓' : '' !!}
                        </span>
                    @endif
                    <span style="font-weight: {{ $item['type'] !== 'checkbox' ? 'normal' : 'bold' }}">
                        {{ $item['label'] }}:
                    </span>
                    @if($item['type'] !== 'checkbox')
                        <span class="value">{{ $item['value'] ?? '---' }}</span>
                    @endif
                </div>
            @endforeach
        </div>
    </div>

    @if($job->report_summary)
    <div class="section" style="page-break-inside: avoid;">
        <div class="section-header">
            <div class="section-title">PODSUMOWANIE RAPORTU</div>
        </div>
        <div style="white-space: pre-wrap; word-wrap: break-word;">{{ $job->report_summary }}</div>
    </div>
    @endif

    @if($job->getMedia('images_before')->count() > 0)
    <div class="section" style="page-break-inside: avoid;">
        <div class="section-header">
            <div class="section-title">ZDJĘCIA PRZED PRACĄ</div>
        </div>
        <div class="photo-grid">
            @foreach($job->getMedia('images_before') as $media)
                <div class="photo">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($media->getPath('large'))) }}">
                </div>
            @endforeach
            <div class="clear"></div>
        </div>
    </div>
    @endif

    @if($job->getMedia('images_after')->count() > 0)
    <div class="section" style="page-break-inside: avoid;">
        <div class="section-header">
            <div class="section-title">ZDJĘCIA PO PRACY</div>
        </div>
        <div class="photo-grid">
            @foreach($job->getMedia('images_after') as $media)
                <div class="photo">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($media->getPath('large'))) }}">
                </div>
            @endforeach
            <div class="clear"></div>
        </div>
    </div>
    @endif

    <div class="signature-box" style="page-break-inside: avoid;">
        <div class="label">PODPIS KLIENTA</div>
        <div style="font-size: 8px; color: #6b7280; margin-bottom: 5px; font-style: italic;">
            Potwierdzam wykonanie prac zgodnie ze zleceniem i bez zastrzeżeń.
        </div>
        @if($job->getFirstMedia('signature'))
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents($job->getFirstMedia('signature')->getPath())) }}" class="signature-image">
            @if($job->completed_at)
                <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">
                    Data i godzina złożenia podpisu: {{ $job->completed_at->format('d.m.Y H:i') }}
                </div>
            @endif
        @else
            <div style="height: 60px; border-bottom: 1px dashed #ccc; width: 200px; display: inline-block;"></div>
        @endif
        <div style="font-size: 10px; margin-top: 5px; font-weight: bold;">{{ $job->client->name }}</div>
    </div>

    <div class="footer">
        System wygenerował ten raport automatycznie. Wszystkie prawa zastrzeżone.
    </div>
</body>
</html>
