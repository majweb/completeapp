<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JobTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ELEKTRYKA
            [
                'name' => 'Przegląd rozdzielnicy elektrycznej',
                'description' => 'Kontrola stanu technicznego i pomiary w rozdzielnicy głównej.',
                'company_id' => null, 'category' => 'Elektryka',
                'structure' => [
                    ['id' => 'visual_inspection', 'label' => 'Oględziny obudowy i oszynowania', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'tightness_check', 'label' => 'Dociągnięcie zacisków (moment dokręcenia)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'rccb_test', 'label' => 'Test wyłączników RCD', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'thermography', 'label' => 'Wynik pomiaru termowizyjnego (°C)', 'type' => 'number', 'required' => false],
                    ['id' => 'parts_replaced', 'label' => 'Wymienione aparaty', 'type' => 'text', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Montaż punktów elektrycznych',
                'description' => 'Montaż gniazd, łączników i wypustów oświetleniowych.',
                'company_id' => null, 'category' => 'Elektryka',
                'structure' => [
                    ['id' => 'sockets_count', 'label' => 'Liczba zamontowanych gniazd', 'type' => 'number', 'required' => true],
                    ['id' => 'switches_count', 'label' => 'Liczba zamontowanych łączników', 'type' => 'number', 'required' => true],
                    ['id' => 'circuit_test', 'label' => 'Test ciągłości przewodów ochronnych', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'labeling', 'label' => 'Opisanie obwodów w rozdzielnicy', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Pomiary elektryczne 5-letnie',
                'description' => 'Kompleksowe pomiary ochrony przeciwporażeniowej i rezystancji izolacji.',
                'company_id' => null, 'category' => 'Elektryka',
                'structure' => [
                    ['id' => 'insulation_res', 'label' => 'Rezystancja izolacji obwodów (MΩ)', 'type' => 'number', 'required' => true],
                    ['id' => 'loop_impedance', 'label' => 'Impedancja pętli zwarcia (Ω)', 'type' => 'number', 'required' => true],
                    ['id' => 'rcd_time', 'label' => 'Czas zadziałania RCD (ms)', 'type' => 'number', 'required' => true],
                    ['id' => 'earthing_res', 'label' => 'Rezystancja uziomu (Ω)', 'type' => 'number', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // HYDRAULIKA
            [
                'name' => 'Przegląd kotła gazowego',
                'description' => 'Okresowy przegląd serwisowy kotła kondensacyjnego.',
                'company_id' => null, 'category' => 'Hydraulika',
                'structure' => [
                    ['id' => 'clean_burner', 'label' => 'Czyszczenie palnika i wymiennika', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'gas_tightness', 'label' => 'Próba szczelności gazu', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'expansion_vessel', 'label' => 'Ciśnienie w naczyniu przeponowym (bar)', 'type' => 'number', 'required' => true],
                    ['id' => 'flue_gas_analysis', 'label' => 'Analiza spalin wykonana', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'notes', 'label' => 'Zalecenia dla użytkownika', 'type' => 'text', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Usuwanie awarii hydraulicznej',
                'description' => 'Lokalizacja i naprawa wycieku lub zatoru.',
                'company_id' => null, 'category' => 'Hydraulika',
                'structure' => [
                    ['id' => 'leak_location', 'label' => 'Miejsce wycieku/awarii', 'type' => 'text', 'required' => true],
                    ['id' => 'material_used', 'label' => 'Zużyte materiały (rury, złączki)', 'type' => 'text', 'required' => false],
                    ['id' => 'pressure_test', 'label' => 'Próba szczelności po naprawie', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Montaż armatury sanitarnej',
                'description' => 'Biały montaż: umywalki, baterie, kabiny prysznicowe.',
                'company_id' => null, 'category' => 'Hydraulika',
                'structure' => [
                    ['id' => 'item_type', 'label' => 'Rodzaj zamontowanego urządzenia', 'type' => 'text', 'required' => true],
                    ['id' => 'silicone_finish', 'label' => 'Wykończenie silikonem', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'flow_test', 'label' => 'Sprawdzenie odpływu i szczelności', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // SERWIS HVAC
            [
                'name' => 'Przegląd klimatyzacji (Standard)',
                'description' => 'Okresowe czyszczenie i odgrzybianie jednostek klimatyzacji.',
                'company_id' => null, 'category' => 'HVAC',
                'structure' => [
                    ['id' => 'clean_filters', 'label' => 'Czyszczenie filtrów jednostki wew.', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'disinfection', 'label' => 'Odgrzybianie parownika', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'drain_test', 'label' => 'Sprawdzenie drożności odpływu skroplin', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'temp_out', 'label' => 'Temperatura nawiewu (°C)', 'type' => 'number', 'required' => true],
                    ['id' => 'condenser_clean', 'label' => 'Czyszczenie skraplacza (jedn. zew.)', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Serwis pompy ciepła',
                'description' => 'Kontrola parametrów pracy układu chłodniczego i wodnego.',
                'company_id' => null, 'category' => 'HVAC',
                'structure' => [
                    ['id' => 'refrigerant_pressure', 'label' => 'Ciśnienie czynnika (bar)', 'type' => 'number', 'required' => true],
                    ['id' => 'glycol_concentration', 'label' => 'Stężenie glikolu (°C)', 'type' => 'number', 'required' => false],
                    ['id' => 'filter_clean', 'label' => 'Czyszczenie filtrów siatkowych', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'anode_check', 'label' => 'Stan anody w zbiorniku CWU', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Montaż klimatyzacji split',
                'description' => 'Uruchomienie nowej instalacji, próba szczelności, próżnia.',
                'company_id' => null, 'category' => 'HVAC',
                'structure' => [
                    ['id' => 'nitrogen_test', 'label' => 'Próba szczelności azotem (bar)', 'type' => 'number', 'required' => true],
                    ['id' => 'vacuum_test', 'label' => 'Czas wykonywania próżni (min)', 'type' => 'number', 'required' => true],
                    ['id' => 'refrigerant_added', 'label' => 'Ilość doładowanego czynnika (g)', 'type' => 'number', 'required' => false],
                    ['id' => 'wall_pass_sealed', 'label' => 'Uszczelnienie przepustu ściennego', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // BUDOWNICTWO / REMONTY
            [
                'name' => 'Protokół odbioru etapu prac malarskich',
                'description' => 'Weryfikacja jakości wykonania gładzi i malowania.',
                'company_id' => null, 'category' => 'Budownictwo',
                'structure' => [
                    ['id' => 'surface_flatness', 'label' => 'Równość powierzchni (pion/poziom)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'color_uniformity', 'label' => 'Jednolitość koloru i brak smug', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'corners_check', 'label' => 'Wykończenie narożników i styków', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'area_m2', 'label' => 'Powierzchnia pomalowana (m2)', 'type' => 'number', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Montaż płyt G-K',
                'description' => 'Wykonanie zabudowy z płyt gipsowo-kartonowych na stelażu.',
                'company_id' => null, 'category' => 'Budownictwo',
                'structure' => [
                    ['id' => 'profile_spacing', 'label' => 'Rozstaw profili (cm)', 'type' => 'number', 'required' => true],
                    ['id' => 'wool_insulation', 'label' => 'Ułożenie wełny mineralnej', 'type' => 'checkbox', 'required' => false],
                    ['id' => 'joint_tape', 'label' => 'Wklejenie taśmy zbrojącej na spoinach', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Układanie płytek / glazury',
                'description' => 'Prace glazurnicze w łazienkach i kuchniach.',
                'company_id' => null, 'category' => 'Budownictwo',
                'structure' => [
                    ['id' => 'hydro_insulation', 'label' => 'Wykonanie hydroizolacji (folia w płynie)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'level_check', 'label' => 'Zachowanie poziomów i spadków', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'grout_color', 'label' => 'Kolor fugi zgodny z zamówieniem', 'type' => 'text', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // SERWIS AGD
            [
                'name' => 'Naprawa pralki/zmywarki',
                'description' => 'Diagnostyka i wymiana części w urządzeniach AGD.',
                'company_id' => null, 'category' => 'Serwis AGD',
                'structure' => [
                    ['id' => 'error_code', 'label' => 'Kod błędu urządzenia', 'type' => 'text', 'required' => false],
                    ['id' => 'fault_found', 'label' => 'Stwierdzona usterka', 'type' => 'text', 'required' => true],
                    ['id' => 'part_replaced', 'label' => 'Wymieniony podzespół (np. pompa, grzałka)', 'type' => 'text', 'required' => false],
                    ['id' => 'test_run', 'label' => 'Program testowy wykonany pomyślnie', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Serwis ekspresu do kawy',
                'description' => 'Odkamienianie, czyszczenie i konserwacja bloku zaparzającego.',
                'company_id' => null, 'category' => 'Serwis AGD',
                'structure' => [
                    ['id' => 'descaling', 'label' => 'Program odkamieniania wykonany', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'o-ring_replaced', 'label' => 'Wymiana uszczelek (O-ring)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'grinder_adjust', 'label' => 'Regulacja młynka', 'type' => 'checkbox', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Naprawa piekarnika / płyty',
                'description' => 'Wymiana grzałek, termostatów lub modułów sterujących.',
                'company_id' => null, 'category' => 'Serwis AGD',
                'structure' => [
                    ['id' => 'temp_check', 'label' => 'Temperatura rzeczywista (°C)', 'type' => 'number', 'required' => true],
                    ['id' => 'insulation_test', 'label' => 'Pomiar prądu upływu', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'fan_check', 'label' => 'Sprawność wentylatora termoobiegu', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // SPRZĄTANIE
            [
                'name' => 'Kontrola jakości - sprzątanie biura',
                'description' => 'Szczegółowa lista kontrolna po wykonaniu usługi sprzątania.',
                'company_id' => null, 'category' => 'Sprzątanie',
                'structure' => [
                    ['id' => 'desks_dusted', 'label' => 'Odkurzenie biurek i powierzchni płaskich', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'trash_emptied', 'label' => 'Opróżnienie koszy na śmieci', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'kitchen_clean', 'label' => 'Sprzątnięcie aneksu kuchennego', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'toilets_sanitized', 'label' => 'Dezynfekcja toalet', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'supplies_refilled', 'label' => 'Uzupełnienie środków higienicznych', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Sprzątanie po-remontowe',
                'description' => 'Usuwanie pyłu, farb i pozostałości pobudowlanych.',
                'company_id' => null, 'category' => 'Sprzątanie',
                'structure' => [
                    ['id' => 'dust_removed', 'label' => 'Odpylenie ścian i sufitów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'window_clean', 'label' => 'Mycie okien i ram z resztek tynku', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'floor_machine', 'label' => 'Maszynowe mycie podłóg', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Pranie tapicerki / wykładzin',
                'description' => 'Ekstrakcyjne czyszczenie mebli tapicerowanych lub biurowych.',
                'company_id' => null, 'category' => 'Sprzątanie',
                'structure' => [
                    ['id' => 'stain_removal', 'label' => 'Odplamianie punktowe', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'ph_test', 'label' => 'Płukanie neutralizujące (pH)', 'type' => 'number', 'required' => false],
                    ['id' => 'drying_time', 'label' => 'Szacowany czas schnięcia (h)', 'type' => 'number', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // OCHRONA / ALARMY
            [
                'name' => 'Konserwacja systemu alarmowego (SSWiN)',
                'description' => 'Okresowe sprawdzenie sprawności czujek, centrali i powiadomienia.',
                'company_id' => null, 'category' => 'Ochrona i Alarmy',
                'structure' => [
                    ['id' => 'battery_voltage', 'label' => 'Napięcie akumulatora (V)', 'type' => 'number', 'required' => true],
                    ['id' => 'detectors_test', 'label' => 'Test wszystkich czujek wykonany', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'signal_test', 'label' => 'Test sygnału do stacji monitorowania', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'siren_test', 'label' => 'Sprawdzenie sygnalizatorów', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Serwis monitoringu CCTV',
                'description' => 'Czyszczenie obiektywów, sprawdzenie archiwizacji nagrań.',
                'company_id' => null, 'category' => 'Ochrona i Alarmy',
                'structure' => [
                    ['id' => 'lens_cleaned', 'label' => 'Czyszczenie kloszy/obiektywów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'storage_health', 'label' => 'Stan dysku twardego (S.M.A.R.T)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'recording_days', 'label' => 'Liczba dni zapisu w pamięci', 'type' => 'number', 'required' => true],
                    ['id' => 'remote_access', 'label' => 'Działanie podglądu mobilnego', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Montaż wideodomofonu',
                'description' => 'Instalacja panelu zewnętrznego i monitorów wew.',
                'company_id' => null, 'category' => 'Ochrona i Alarmy',
                'structure' => [
                    ['id' => 'audio_quality', 'label' => 'Jakość połączenia głosowego', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'video_quality', 'label' => 'Ostrość obrazu w dzień/nocy', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'gate_release', 'label' => 'Otwieranie rygla/bramy', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // FOTOWOLTAIKA
            [
                'name' => 'Przegląd instalacji fotowoltaicznej',
                'description' => 'Kontrola stanu modułów, inwertera i zabezpieczeń DC/AC.',
                'company_id' => null, 'category' => 'Fotowoltaika',
                'structure' => [
                    ['id' => 'panel_visual', 'label' => 'Oględziny paneli (pęknięcia, przebarwienia)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'inverter_status', 'label' => 'Status inwertera i logi błędów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'string_voltage', 'label' => 'Napięcie stringów (V)', 'type' => 'number', 'required' => true],
                    ['id' => 'earthing_test', 'label' => 'Pomiar rezystancji uziemienia', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'mc4_check', 'label' => 'Stan złączek MC4', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Uruchomienie instalacji PV',
                'description' => 'Konfiguracja inwertera, połączenie z portalem monitoringu.',
                'company_id' => null, 'category' => 'Fotowoltaika',
                'structure' => [
                    ['id' => 'wifi_connected', 'label' => 'Połączenie z domową siecią Wi-Fi', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'grid_country', 'label' => 'Ustawiony kod sieci (PL)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'power_limit', 'label' => 'Ograniczenie mocy wypływu (jeśli wymagane)', 'type' => 'checkbox', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Pomiary elektryczne DC/AC (PV)',
                'description' => 'Pomiary izolacji strony DC oraz pętli zwarcia strony AC.',
                'company_id' => null, 'category' => 'Fotowoltaika',
                'structure' => [
                    ['id' => 'r_iso_dc', 'label' => 'Rezystancja izolacji DC (MΩ)', 'type' => 'number', 'required' => true],
                    ['id' => 'voc_measurement', 'label' => 'Napięcie Voc na każdym stringu (V)', 'type' => 'number', 'required' => true],
                    ['id' => 'surge_prot', 'label' => 'Stan ograniczników przepięć SPD', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // OGRODY / ARCHITEKTURA KRAJOBRAZU
            [
                'name' => 'Serwis systemu nawadniania',
                'description' => 'Uruchomienie wiosenne lub konserwacja systemu podlewania.',
                'company_id' => null, 'category' => 'Ogrody',
                'structure' => [
                    ['id' => 'pump_check', 'label' => 'Sprawdzenie wydajności pompy', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'filter_clean', 'label' => 'Czyszczenie filtrów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'sprinkler_adjust', 'label' => 'Regulacja zasięgu zraszaczy', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'leak_test', 'label' => 'Szczelność rurociągów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'controller_program', 'label' => 'Zaprogramowanie sterownika', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Pielęgnacja trawnika',
                'description' => 'Koszenie, aeracja, wertykulacja i nawożenie.',
                'company_id' => null, 'category' => 'Ogrody',
                'structure' => [
                    ['id' => 'mowing_height', 'label' => 'Wysokość koszenia (mm)', 'type' => 'number', 'required' => true],
                    ['id' => 'fertilizer_type', 'label' => 'Rodzaj zastosowanego nawozu', 'type' => 'text', 'required' => true],
                    ['id' => 'scarification', 'label' => 'Wertykulacja wykonana', 'type' => 'checkbox', 'required' => false],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Przycinanie krzewów i drzew',
                'description' => 'Cięcia formujące i sanitarne roślin ogrodowych.',
                'company_id' => null, 'category' => 'Ogrody',
                'structure' => [
                    ['id' => 'waste_removal', 'label' => 'Utylizacja gałęzi/bioodpadów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'healing_paste', 'label' => 'Zabezpieczenie ran po cięciu', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'pest_check', 'label' => 'Brak oznak chorób/szkodników', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],

            // DEKARSTWO
            [
                'name' => 'Przegląd poszycia dachowego',
                'description' => 'Kontrola szczelności dachu i stanu obróbek blacharskich.',
                'company_id' => null, 'category' => 'Dekarstwo',
                'structure' => [
                    ['id' => 'tile_condition', 'label' => 'Stan dachówek/blachy', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'chimney_flashing', 'label' => 'Szczelność obróbek komina', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'gutter_clean', 'label' => 'Drożność i czystość rynien', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'roof_window', 'label' => 'Stan uszczelek okien dachowych', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Naprawa rynien / obróbek',
                'description' => 'Wymiana uszkodzonych elementów odprowadzania wody.',
                'company_id' => null, 'category' => 'Dekarstwo',
                'structure' => [
                    ['id' => 'leak_fixed', 'label' => 'Uszczelnienie połączeń rynien', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'fall_correction', 'label' => 'Korekta spadków rynien', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'bracket_tighten', 'label' => 'Dokręcenie haków rynnowych', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Czyszczenie i impregnacja dachu',
                'description' => 'Mycie ciśnieniowe i malowanie ochronne dachówki.',
                'company_id' => null, 'category' => 'Dekarstwo',
                'structure' => [
                    ['id' => 'moss_removed', 'label' => 'Usunięcie mchów i porostów', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'coating_layers', 'label' => 'Liczba nałożonych warstw impregnatu', 'type' => 'number', 'required' => true],
                    ['id' => 'dry_time', 'label' => 'Czas schnięcia między warstwami (h)', 'type' => 'number', 'required' => false],
                ],
                'version' => '1.0',
            ],

            // SERWIS PPOŻ
            [
                'name' => 'Przegląd podręcznego sprzętu gaśniczego',
                'description' => 'Okresowa kontrola gaśnic i agregatów proszkowych.',
                'company_id' => null, 'category' => 'Serwis PPOŻ',
                'structure' => [
                    ['id' => 'pressure_gauge', 'label' => 'Wskazanie manometru (pole zielone)', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'hose_condition', 'label' => 'Stan węża i prądownicy', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'label_legible', 'label' => 'Czytelność etykiety i instrukcji', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'new_seal', 'label' => 'Założenie nowej kontrolki (plomby)', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Badanie wydajności hydrantów',
                'description' => 'Pomiar ciśnienia statycznego i dynamicznego oraz wydajności.',
                'company_id' => null, 'category' => 'Serwis PPOŻ',
                'structure' => [
                    ['id' => 'p_stat', 'label' => 'Ciśnienie statyczne (MPa)', 'type' => 'number', 'required' => true],
                    ['id' => 'p_dyn', 'label' => 'Ciśnienie dynamiczne (MPa)', 'type' => 'number', 'required' => true],
                    ['id' => 'flow_rate', 'label' => 'Wydajność hydrantu (l/s)', 'type' => 'number', 'required' => true],
                    ['id' => 'hose_rolled', 'label' => 'Przewinięcie węża hydrantowego', 'type' => 'checkbox', 'required' => true],
                ],
                'version' => '1.0',
            ],
            [
                'name' => 'Przegląd oświetlenia awaryjnego',
                'description' => 'Test czasu świecenia opraw w trybie awaryjnym.',
                'company_id' => null, 'category' => 'Serwis PPOŻ',
                'structure' => [
                    ['id' => 'test_mode', 'label' => 'Wywołanie testu autonomicznego', 'type' => 'checkbox', 'required' => true],
                    ['id' => 'duration_time', 'label' => 'Czas świecenia (minut)', 'type' => 'number', 'required' => true],
                    ['id' => 'battery_replaced', 'label' => 'Wymiana akumulatora w oprawie', 'type' => 'checkbox', 'required' => false],
                ],
                'version' => '1.0',
            ],
        ];

        foreach ($templates as $templateData) {
            \App\Models\JobTemplate::updateOrCreate(
                ['name' => $templateData['name'], 'company_id' => null],
                $templateData
            );
        }
    }
}
