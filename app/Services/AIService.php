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
                            'content' => 'Jesteś profesjonalnym asystentem technicznym. Na podstawie dostarczonych danych ze zlecenia serwisowego, wygeneruj zwięzłe, profesjonalne podsumowanie wykonanych prac w języku polskim. Skup się na kluczowych wynikach checklisty i ewentualnych uwagach.'
                        ],
                        [
                            'role' => 'user',
                            'content' => "Zlecenie: {$job->template->name}\nKlient: {$job->client->name}\nDane z checklisty:\n" . json_encode($jobData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 500,
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
        $data = [];
        if ($job->checklist && is_array($job->checklist->content)) {
            foreach ($job->checklist->content as $item) {
                $value = $item['value'] ?? 'brak danych';
                if ($item['type'] === 'checkbox') {
                    $value = $item['value'] ? 'TAK' : 'NIE';
                }
                $data[] = [
                    'etykieta' => $item['label'],
                    'wartosc' => $value
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
