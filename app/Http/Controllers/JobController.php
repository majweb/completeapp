<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Mail\JobReportMail;
use App\Mail\RequestSignatureMail;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Services\AIService;
use App\Services\SMSService;
use App\Services\SubscriptionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class JobController extends Controller
{
    public function generateSummary(Job $job, AIService $aiService)
    {
        Gate::authorize('generateSummary', $job);

        // Walidacja gotowości do raportu
        if (! $job->isReadyForReport()) {
            $message = 'Uzupełnij checklistę i załącz wymagane zdjęcia, aby wygenerować raport.';

            if ($job->status === JobStatus::NEW) {
                $message = 'Rozpocznij pracę, uzupełnij checklistę i załącz wymagane zdjęcia, aby wygenerować raport.';
            }

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $message,
            ]);

            return back();
        }

        // Ograniczenie do raz na 30 minut
        if ($job->last_summary_generated_at && $job->last_summary_generated_at->addMinutes(30)->isFuture()) {
            $diff = $job->last_summary_generated_at->addMinutes(30)->diffForHumans();
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Podsumowanie można odświeżyć raz na 30 minut. Spróbuj ponownie za ok. {$diff}.",
            ]);

            return back();
        }

        if ($job->status === JobStatus::APPROVED) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Nie można generować podsumowania dla zatwierdzonego zlecenia.',
            ]);

            return back();
        }

        $summary = $aiService->generateJobSummary($job);

        $job->update([
            'report_summary' => $summary,
            'last_summary_generated_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Podsumowanie AI zostało wygenerowane.',
        ]);

        return back();
    }

    public function downloadReport(Job $job)
    {
        Gate::authorize('view', $job);

        if ($job->status->value !== 'completed' && $job->status->value !== 'approved') {
            return back()->with('error', 'Raport jest dostępny tylko dla zakończonych zleceń.');
        }

        $job->load(['client', 'technician', 'template', 'checklist', 'company']);

        // Walidacja checklisty
        if ($job->checklist) {
            foreach ($job->checklist->content as $item) {
                $val = $item['value'] ?? null;
                if (! empty($item['required']) && ($val === null || $val === '' || $val === false)) {
                    return back()->with('error', 'Nie można wygenerować raportu. Checklista nie jest kompletna.');
                }
            }
        }

        $pdf = Pdf::loadView('pdf.report', ['job' => $job]);

        return $pdf->stream("raport_zlecenie_{$job->id}.pdf");
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Job::class);

        $user = auth()->user();
        $query = $user->company->jobs()->with(['client', 'technician']);

        // Wyszukiwanie
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereRelation('client', 'name', 'like', "%{$search}%");
            });
        }

        // Filtrowanie po statusie
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filtrowanie po techniku (tylko owner/manager)
        if ($user->role !== 'technician' && $request->filled('technician_id')) {
            $query->where('assigned_to', $request->input('technician_id'));
        }

        // Technicy widzą tylko swoje zlecenia
        if ($user->role === 'technician') {
            $query->whereRelation('technician', 'id', $user->id);
        }

        return Inertia::render('jobs/index', [
            'jobs' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'technician_id']),
            'technicians' => $user->role !== 'technician'
                ? $user->company->users()->whereIn('role', ['technician', 'manager', 'owner'])->get(['id', 'name'])
                : [],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Job::class);

        $user = auth()->user();

        return Inertia::render('jobs/create', [
            'clients' => $user->company->clients()->orderBy('name')->get(),
            'templates' => $user->company->jobTemplates()->where('is_active', true)->orderBy('name')->get(),
            'technicians' => $user->company->users()
                ->whereIn('role', ['technician', 'manager', 'owner'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request, SubscriptionService $subscriptionService)
    {
        if (auth()->user()->is_demo) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Dodawanie zleceń jest zablokowane w wersji demo.',
            ]);

            return back();
        }

        Gate::authorize('create', Job::class);

        $company = auth()->user()->company;

        // Sprawdź limit zleceń w tym miesiącu
        $limit = $subscriptionService->getLimit($company, 'jobs_per_month');
        $currentMonthCount = Job::where('company_id', $company->id)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        if ($currentMonthCount >= $limit) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Osiągnięto limit zleceń na ten miesiąc dla Twojego planu.',
            ]);

            return redirect()->back();
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'template_id' => 'required|exists:job_templates,id',
            'assigned_to' => 'required|exists:users,id',
            'scheduled_at' => 'required|date|after_or_equal:today',
        ], [], [
            'client_id' => 'klient',
            'template_id' => 'szablon',
            'assigned_to' => 'technik',
            'scheduled_at' => 'data i godzina wykonania',
        ]);

        return DB::transaction(function () use ($validated) {
            $job = Job::create(array_merge($validated, [
                'status' => JobStatus::NEW,
            ]));

            $template = JobTemplate::find($validated['template_id']);
            $template->generateChecklist($job);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało utworzone.']);

            return redirect()->route('jobs.index');
        });
    }

    public function show(Job $job)
    {
        Gate::authorize('view', $job);

        $job->load(['client', 'technician', 'template', 'checklist.auditLogs.user', 'auditLogs.user']);

        $allLogs = $job->auditLogs->concat($job->checklist ? $job->checklist->auditLogs : collect())
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('jobs/show', [
            'twilio_enabled' => config('services.twilio.enabled'),
            'is_ready_for_signature' => $job->isReadyForSignature(),
            'is_ready_for_report' => $job->isReadyForReport(),
            'job' => array_merge($job->toArray(), [
                'audit_logs' => $allLogs,
                'media' => [
                    'images_before' => $job->getMedia('images_before')->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->getUrl('thumb'),
                        'original_url' => $m->getUrl('large'),
                    ]),
                    'images_after' => $job->getMedia('images_after')->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->getUrl('thumb'),
                        'original_url' => $m->getUrl('large'),
                    ]),
                    'problems' => $job->getMedia('problems')->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->getUrl('thumb'),
                        'original_url' => $m->getUrl('large'),
                    ]),
                    'signature' => $job->getFirstMediaUrl('signature'),
                ],
            ]),
        ]);
    }

    public function edit(Job $job)
    {
        Gate::authorize('update', $job);

        $user = auth()->user();

        return Inertia::render('jobs/edit', [
            'job' => $job,
            'clients' => $user->company->clients()->orderBy('name')->get(),
            'templates' => $user->company->jobTemplates()->orderBy('name')->get(),
            'technicians' => $user->company->users()
                ->whereIn('role', ['technician', 'manager', 'owner'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Job $job)
    {
        Gate::authorize('update', $job);

        // Jeśli status to completed i próba zmiany na in_progress (re-opening)
        if ($job->status->value === 'completed' && $request->status === 'in_progress') {
            $job->update([
                'status' => 'in_progress',
                'completed_at' => null,
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało przywrócone do edycji.']);

            return back();
        }

        // Jeśli status to completed lub approved, blokujemy każdą inną edycję (nawet dla managera)
        if (in_array($job->status->value, ['completed', 'approved'])) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Nie można edytować zamkniętego zlecenia.']);
            return back();
        }

        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'assigned_to' => 'sometimes|exists:users,id',
            'scheduled_at' => 'sometimes|date|after_or_equal:today',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'sometimes|string',
            'checklist_content' => 'sometimes|array',
            'report_summary' => 'sometimes|nullable|string',
            'send_sms' => 'sometimes|boolean',
        ], [], [
            'client_id' => 'klient',
            'assigned_to' => 'technik',
            'scheduled_at' => 'zaplanowana data i godzina',
            'started_at' => 'data rozpoczęcia',
            'completed_at' => 'data zakończenia',
            'report_summary' => 'podsumowanie raportu',
        ]);

        if ($request->filled('started_at') && ($request->status ?? $job->status->value) === 'new') {
            $validated['status'] = 'in_progress';
        }

        if ($request->filled('completed_at') && ($request->status ?? $job->status->value) !== 'completed') {
            $validated['status'] = 'completed';
        }

        if ($request->has('status')) {
            if ($request->status === 'new' && $job->status->value !== 'new') {
                unset($validated['status']);
            } elseif ($request->status === $job->status->value) {
                unset($validated['status']);
            }
        }

        if ($request->has('checklist_content')) {
            $checklist_content = $request->checklist_content;

            // Walidacja pól wymaganych w checklist_content
            $errors = [];
            foreach ($checklist_content as $index => $item) {
                $val = $item['value'] ?? null;
                if (! empty($item['required']) && ($val === null || $val === '' || $val === false)) {
                    $errors["checklist_content.{$index}.value"] = 'To pole jest wymagane.';
                }
            }

            if (! empty($errors)) {
                return back()->withErrors($errors);
            }

            $isCompleted = count($checklist_content) > 0;
            foreach ($checklist_content as $item) {
                $val = $item['value'] ?? null;
                if (! empty($item['required']) && ($val === null || $val === '' || $val === false)) {
                    $isCompleted = false;
                    break;
                }
            }

            $currentContent = $job->checklist->content;
            $currentIsCompleted = $job->checklist->is_completed;

            // Tylko jeśli faktycznie coś się zmieniło w zawartości lub statusie skompletowania
            if ($currentContent !== $checklist_content || (bool) $currentIsCompleted !== (bool) $isCompleted) {
                $job->checklist->update([
                    'content' => $checklist_content,
                    'is_completed' => $isCompleted,
                ]);
            }
        }

        if ($request->has('status')) {
            if ($request->status === 'in_progress' && ! $job->started_at && ! isset($validated['started_at'])) {
                $validated['started_at'] = now();
            }

            if ($request->status === $job->status->value) {
                unset($validated['status']);
            }

            if ($request->status === 'completed') {
                if (! $job->started_at && ! isset($validated['started_at'])) {
                    Inertia::flash('toast', ['type' => 'error', 'message' => 'Nie można zakończyć zlecenia, które nie zostało rozpoczęte.']);

                    return back();
                }

                $template = $job->template;
                $workflowErrors = [];

                if ($template->require_photo_before && $job->getMedia('images_before')->count() === 0) {
                    $workflowErrors['media.images_before'] = 'Wymagane jest co najmniej jedno zdjęcie PRZED.';
                }

                if ($template->require_photo_after && $job->getMedia('images_after')->count() === 0) {
                    $workflowErrors['media.images_after'] = 'Wymagane jest co najmniej jedno zdjęcie PO.';
                }

                if ($template->require_signature && ! $job->hasMedia('signature')) {
                    $workflowErrors['media.signature'] = 'Wymagany jest podpis klienta.';
                }

                if (! empty($workflowErrors)) {
                    if ($request->header('X-Inertia')) {
                        return back()->withErrors($workflowErrors);
                    }

                    return response()->json(['errors' => $workflowErrors], 422);
                }

                if (! $job->completed_at && ! isset($validated['completed_at'])) {
                    $validated['completed_at'] = now();
                }
            }
        }

        $wasCompleted = $job->status->value !== 'completed' && ($validated['status'] ?? $job->status->value) === 'completed';

        $job->update($validated);

        if ($wasCompleted && $request->boolean('send_sms') && $job->client->phone) {
            app(SMSService::class)->send(
                $job->client->phone,
                "Twoje zlecenie #{$job->id} zostało zakończone. Dziękujemy!"
            );
        }

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Zmiany zostały zapisane.']);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało zaktualizowane.']);

        return redirect()->route('jobs.index');
    }

    public function uploadMedia(Request $request, Job $job)
    {
        Gate::authorize('update', $job);

        $request->validate([
            'image' => 'required|image|max:10240', // Increase to 10MB
            'collection' => 'required|string|in:images_before,images_after,problems',
        ]);

        $job->addMediaFromRequest('image')
            ->toMediaCollection($request->collection);

        return back();
    }

    public function deleteMedia(Job $job, Media $media)
    {
        Gate::authorize('update', $job);

        if ($media->model_id === $job->id && $media->model_type === Job::class) {
            $media->delete();
        }

        return back();
    }

    public function reorderMedia(Request $request, Job $job)
    {
        Gate::authorize('update', $job);

        $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'integer|exists:media,id',
        ]);

        Media::setNewOrder($request->media_ids);

        return back();
    }

    public function sendReport(Job $job)
    {
        Gate::authorize('view', $job);

        if (auth()->user()->is_demo) {
            return back()->with('error', 'Wersja Demo: wysyłanie raportów jest zablokowane.');
        }

        if ($job->status->value !== 'approved') {
            return back()->with('error', 'Wysyłka raportu jest możliwa tylko dla zatwierdzonych zleceń.');
        }

        $job->load(['client', 'technician', 'template', 'checklist', 'company']);

        // Walidacja checklisty
        if ($job->checklist) {
            foreach ($job->checklist->content as $item) {
                $val = $item['value'] ?? null;
                if (! empty($item['required']) && ($val === null || $val === '' || $val === false)) {
                    return back()->with('error', 'Nie można wysłać raportu. Checklista nie jest kompletna.');
                }
            }
        }

        if (! $job->client->email) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Klient nie posiada adresu email.']);

            return back();
        }

        // Generowanie PDF tymczasowo
        $pdf = Pdf::loadView('pdf.report', ['job' => $job]);
        $fileName = "report_{$job->id}.pdf";
        $filePath = "temp/{$fileName}";

        Storage::disk('local')->put($filePath, $pdf->output());
        $fullPath = storage_path("app/private/{$filePath}");

        try {
            Mail::to($job->client->email)->send(new JobReportMail($job, $fullPath));
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Raport został wysłany do klienta.']);
        } catch (\Exception $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Błąd podczas wysyłki: '.$e->getMessage()]);
        } finally {
            Storage::disk('local')->delete($filePath);
        }

        return back();
    }

    public function saveSignature(Request $request, Job $job)
    {
        Gate::authorize('update', $job);

        $request->validate([
            'signature' => 'required|string', // base64
        ]);

        $job->addMediaFromBase64($request->signature)
            ->usingFileName("signature_{$job->id}.png")
            ->toMediaCollection('signature');

        return back();
    }

    public function requestSignature(Job $job)
    {
        Gate::authorize('update', $job);

        if (! $job->isReadyForSignature()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Zlecenie nie jest gotowe do podpisu. Uzupełnij checklistę i wymagane zdjęcia.',
            ]);

            return back();
        }

        if (! $job->client->email) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Klient nie posiada adresu email.']);

            return back();
        }

        $url = URL::temporarySignedRoute(
            'client.signature.show',
            now()->addDays(1),
            ['job' => $job->id]
        );

        try {
            Mail::to($job->client->email)->send(new RequestSignatureMail($job, $url));
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Prośba o podpis została wysłana do klienta.']);
        } catch (\Exception $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Błąd podczas wysyłki: '.$e->getMessage()]);
        }

        return back();
    }

    public function approve(Job $job)
    {
        Gate::authorize('approve', $job);

        $job->update([
            'status' => JobStatus::APPROVED,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało zatwierdzone.']);

        return back();
    }

    public function destroy(Job $job)
    {
        Gate::authorize('delete', $job);

        $job->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało usunięte.']);

        return redirect()->route('jobs.index');
    }

    public function duplicate(Job $job, SubscriptionService $subscriptionService)
    {
        if (auth()->user()->is_demo) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Duplikowanie zleceń jest zablokowane w wersji demo.',
            ]);

            return back();
        }

        Gate::authorize('create', Job::class);
        Gate::authorize('view', $job);

        $company = auth()->user()->company;

        // Sprawdź limit zleceń w tym miesiącu
        $limit = $subscriptionService->getLimit($company, 'jobs_per_month');
        $currentMonthCount = Job::where('company_id', $company->id)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        if ($currentMonthCount >= $limit) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Osiągnięto limit zleceń na ten miesiąc dla Twojego planu.',
            ]);

            return redirect()->back();
        }

        return DB::transaction(function () use ($job) {
            $newJob = Job::withoutEvents(function () use ($job) {
                return Job::create([
                    'company_id' => $job->company_id,
                    'client_id' => $job->client_id,
                    'template_id' => $job->template_id,
                    'assigned_to' => $job->assigned_to,
                    'status' => JobStatus::NEW,
                    'scheduled_at' => now()->addDay()->setHour(9)->setMinute(0),
                ]);
            });

            $newJob->template->generateChecklist($newJob);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało zduplikowane.']);

            return redirect()->route('jobs.index');
        });
    }
}
