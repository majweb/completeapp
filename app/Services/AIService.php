<?php

namespace App\Services;

use App\Models\Job;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected ?string $apiKey;
    protected ?string $model;
    protected bool $enabled;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key');
        $this->model = config('services.openai.model', 'gpt-4o-mini');
        $this->enabled = config('services.openai.enabled', false);
    }

    /**
     * Generuje podsumowanie zlecenia na podstawie danych z checklisty.
     */
    public function generateJobSummary(Job $job): string
    {
        if (!$this->enabled) {
            return "Funkcja AI jest wyłączona w konfiguracji systemowej.";
        }

        if (empty($this->apiKey)) {
            return $this->generateMockSummary($job);
        }

        $jobData = $this->prepareJobDataForAI($job);

        try {
            $response = Http::withToken($this->apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Jesteś ekspertem technicznym i specjalistą ds. obsługi klienta w firmie serwisowej.
Twoim zadaniem jest przygotowanie profesjonalnego, eleganckiego podsumowania zlecenia dla klienta.

Zasady redakcji:
1. Używaj języka korzyści i tonu eksperckiego, ale przystępnego.
2. Struktura raportu:
   - Cel wizyty (krótkie nawiązanie do typu usługi).
   - Przebieg prac (najważniejsze punkty z checklisty, sformułowane jako czynności wykonane).
   - Wynik weryfikacji (potwierdzenie sprawności lub lista wykrytych nieprawidłowości).
   - Rekomendacje (zalecenia dla klienta na przyszłość, np. termin kolejnego przeglądu).
3. Nie używaj sformułowań typu "na podstawie danych", "system wygenerował". Pisz tak, jakby pisał to technik.
4. Unikaj powtarzania etykiet "TAK/NIE" – zamiast "Sprawdzenie szczelności: TAK", napisz "Przeprowadzono test szczelności układu z wynikiem pozytywnym".
5. Formatowanie: Używaj pogrubienia (np. **tekst**) dla kluczowych terminów, parametrów technicznych lub nagłówków sekcji (np. **Cel wizyty:**). Nie używaj gwiazdek (*) do tworzenia list wypunktowanych (użyj myślników).
6. Nie dodawaj na końcu podziękowań ani formułek typu "Dziękujemy za zaufanie". Raport powinien kończyć się na rekomendacjach.'
                        ],
                        [
                            'role' => 'user',
                            'content' => "Zlecenie: {$job->template->name}\nOpis usługi: {$job->template->description}\nKlient: {$job->client->name}\nUwagi o kliencie: {$job->client->notes}\nDane z checklisty:\n" . json_encode($jobData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 800,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            Log::error('OpenAI API error: ' . $response->body());
            return $this->generateMockSummary($job);

        } catch (\Exception $e) {
            Log::error('AI Summary generation failed: ' . $e->getMessage());
            return $this->generateMockSummary($job);
        }
    }

    protected function prepareJobDataForAI(Job $job): array
    {
        $data = [
            'typ_uslugi' => $job->template->name,
            'wyniki_inspekcji' => []
        ];

        if ($job->checklist && is_array($job->checklist->content)) {
            foreach ($job->checklist->content as $item) {
                $value = $item['value'] ?? 'nie dotyczy';
                if ($item['type'] === 'checkbox') {
                    $value = $item['value'] ? 'Potwierdzono / Prawidłowe' : 'Brak / Nieprawidłowe';
                }
                $data['wyniki_inspekcji'][] = [
                    'element' => $item['label'],
                    'status' => $value
                ];
            }
        }
        return $data;
    }

    /**
     * Generuje uproszczone podsumowanie w przypadku braku API Key.
     */
    protected function generateMockSummary(Job $job): string
    {
        return "Przykładowe podsumowanie (MOCK):\n\n" .
            "Zlecenie {$job->template->name} zostało wykonane dla klienta {$job->client->name}. " .
            "Wszystkie punkty checklisty zostały zweryfikowane. Stan urządzeń oceniono jako dobry. " .
            "Nie stwierdzono wycieków ani uszkodzeń mechanicznych. System działa poprawnie.";
    }
}
