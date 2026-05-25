<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Instrukcja Użytkowania - Zlecenio</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; line-height: 1.6; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; display: table; width: 100%; }
        .header-text { display: table-cell; vertical-align: middle; }
        .header-logo { display: table-cell; vertical-align: middle; text-align: right; }
        .header-logo img { max-height: 50px; }
        .title { font-size: 22px; font-weight: bold; color: #1e40af; }
        .subtitle { font-size: 14px; color: #6b7280; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; background: #f3f4f6; padding: 8px; border-left: 4px solid #3b82f6; margin-bottom: 10px; }
        .role-title { font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
        ul { margin-top: 5px; padding-left: 20px; }
        li { margin-bottom: 5px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 5px; }
        .page-break { page-break-after: always; }
        .important { font-weight: bold; color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-text">
            <div class="title">Zlecenio - Instrukcja Użytkowania</div>
            <div class="subtitle">Przewodnik po funkcjach i uprawnieniach systemu</div>
        </div>
        <div class="header-logo">
            <img src="{{ public_path('logo-full-croped.png') }}" alt="Zlecenio Logo">
        </div>
    </div>

    <div class="section">
        <div class="section-title">1. Wprowadzenie</div>
        <p>Witaj w Zlecenio! Niniejsza instrukcja pomoże Ci zrozumieć, jak efektywnie korzystać z systemu w zależności od przypisanej Ci roli. System został zaprojektowany, aby usprawnić zarządzanie zleceniami, klientami i dokumentacją technologiczną.</p>
    </div>

    <div class="section">
        <div class="section-title">2. Instrukcje dla poszczególnych ról</div>

        <div class="role-title">Właściciel (Owner)</div>
        <p>Jako właściciel masz pełną kontrolę nad organizacją w systemie.</p>
        <ul>
            <li><strong>Tworzenie zleceń:</strong> Możesz samodzielnie dodawać nowe zlecenia, przypisywać je do techników i zarządzać ich przebiegiem.</li>
            <li><strong>Zarządzanie kontem firmy:</strong> W ustawieniach możesz zmienić nazwę firmy, dane adresowe oraz logo, które pojawi się na raportach PDF.</li>
            <li><strong>Subskrypcje:</strong> Masz dostęp do zarządzania planem subskrypcji i pobierania faktur.</li>
            <li><strong>Zarządzanie zespołem:</strong> Możesz dodawać nowych Techników i Managerów, a także edytować ich dane lub blokować dostęp.</li>
            <li><strong>Analiza danych:</strong> Dashboard dostarcza Ci pełnych statystyk dotyczących wszystkich zleceń w Twojej firmie.</li>
        </ul>

        <div class="role-title">Manager</div>
        <p>Twoim głównym zadaniem jest koordynacja pracy zespołu i dbanie o bazę klientów.</p>
        <ul>
            <li><strong>Tworzenie zleceń:</strong> Możesz planować nowe prace, wybierać szablony i przypisywać do nich konkretnych techników.</li>
            <li><strong>Baza Klientów:</strong> Możesz dodawać, edytować i importować listę klientów.</li>
            <li><strong>Szablony prac:</strong> Twórz i modyfikuj szablony checklist, które technicy wypełniają podczas pracy.</li>
            <li><strong>Weryfikacja raportów:</strong> Masz podgląd do wszystkich zleceń. Możesz weryfikować poprawność wykonanych prac i zatwierdzać raporty przed wysyłką do klienta.</li>
        </ul>

        <div class="role-title">Technik (Mobile User)</div>
        <p>Skupiasz się na realizacji zleceń w terenie przy użyciu urządzenia mobilnego.</p>
        <ul>
            <li><strong>Widok zleceń:</strong> Widzisz tylko te zlecenia, które zostały przypisane bezpośrednio do Ciebie.</li>
            <li><strong>Realizacja pracy:</strong> Po otwarciu zlecenia możesz zmienić jego status (np. na "W trakcie").</li>
            <li><strong>Dokumentacja:</strong>
                <ul>
                    <li>Wypełniaj punkty checklisty zgodnie ze stanem faktycznym.</li>
                    <li>Rób zdjęcia "Przed" i "Po" wykonaniu usługi bezpośrednio w aplikacji.</li>
                </ul>
            </li>
            <li><strong>Podpis klienta:</strong> Po zakończeniu prac poproś klienta o złożenie podpisu na ekranie urządzenia.</li>
        </ul>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">3. Proces realizacji zlecenia (Krok po kroku)</div>
        <ol>
            <li><strong>Utworzenie:</strong> Manager lub Właściciel tworzy zlecenie, wybierając klienta, szablon i technika.</li>
            <li><strong>Powiadomienie:</strong> Technik otrzymuje informację o nowym zleceniu (widoczne w jego panelu).</li>
            <li><strong>Rozpoczęcie:</strong> Technik przyjeżdża na miejsce i klika "Rozpocznij" w aplikacji.</li>
            <li><strong>Dokumentacja:</strong> Technik robi zdjęcia, wypełnia checklistę i zapisuje notatki.</li>
            <li><strong>Zakończenie:</strong> Klient podpisuje raport na urządzeniu technika. Status zmienia się na "Zakończone".</li>
            <li><strong>Raport:</strong> System automatycznie generuje profesjonalny raport PDF, który może zostać wysłany do klienta.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">4. Pomoc i wsparcie</div>
        <p>W przypadku problemów technicznych możesz skontaktować się z naszym wsparciem poprzez formularz kontaktowy dostępny w menu systemu.</p>
        <p class="important">Pamiętaj: Regularne aktualizowanie statusów i staranne wypełnianie checklist zapewnia wysoką jakość dokumentacji dla Twoich klientów.</p>
    </div>

    <div class="footer">
        Zlecenio - Twoje narzędzie do zarządzania zleceniami | Generowano: {{ now()->format('d.m.Y') }}
    </div>
</body>
</html>
