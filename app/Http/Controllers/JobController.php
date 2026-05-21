<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Models\Job;
use App\Models\JobTemplate;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Mail\JobReportMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use App\Services\AIService;

class JobController extends Controller
{
    public function generateSummary(Job $job, AIService $aiService)
    {
        Gate::authorize('update', $job);

        $summary = $aiService->generateJobSummary($job);

        $job->update([
            'report_summary' => $summary,
        ]);

        return back()->with('success', 'Podsumowanie AI zostało wygenerowane.');
    }

    public function downloadReport(Job $job)
    {
        Gate::authorize('view', $job);

        $job->load(['client', 'technician', 'template', 'checklist', 'company']);

        $pdf = Pdf::loadView('pdf.report', ['job' => $job]);

        return $pdf->stream("raport_zlecenie_{$job->id}.pdf");
    }
    public function index()
    {
        Gate::authorize('viewAny', Job::class);

        return Inertia::render('jobs/index', [
            'jobs' => auth()->user()->company->jobs()
                ->with(['client', 'technician'])
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Job::class);

        $user = auth()->user();

        return Inertia::render('jobs/create', [
            'clients' => $user->company->clients()->orderBy('name')->get(),
            'templates' => $user->company->jobTemplates()->orderBy('name')->get(),
            'technicians' => $user->company->users()
                ->whereIn('role', ['technician', 'manager', 'owner'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request, SubscriptionService $subscriptionService)
    {
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

        $job->load(['client', 'technician', 'template', 'checklist', 'auditLogs.user']);

        return Inertia::render('jobs/show', [
            'twilio_enabled' => config('services.twilio.enabled'),
            'job' => array_merge($job->toArray(), [
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

        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'assigned_to' => 'sometimes|exists:users,id',
            'scheduled_at' => 'sometimes|date|after_or_equal:today',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'sometimes|string',
            'checklist_content' => 'sometimes|array',
            'send_sms' => 'sometimes|boolean',
        ], [], [
            'client_id' => 'klient',
            'assigned_to' => 'technik',
            'scheduled_at' => 'zaplanowana data i godzina',
            'started_at' => 'data rozpoczęcia',
            'completed_at' => 'data zakończenia',
        ]);

        if ($request->filled('started_at') && ($request->status ?? $job->status->value) === 'new') {
            $validated['status'] = 'in_progress';
        }

        if ($request->filled('completed_at') && ($request->status ?? $job->status->value) !== 'completed') {
            $validated['status'] = 'completed';
        }

        if ($request->has('checklist_content')) {
            $checklist_content = $request->checklist_content;

            // Walidacja pól wymaganych w checklist_content
            $errors = [];
            foreach ($checklist_content as $index => $item) {
                $val = $item['value'] ?? null;
                if (!empty($item['required']) && ($val === null || $val === '' || $val === false)) {
                    $errors["checklist_content.{$index}.value"] = "To pole jest wymagane.";
                }
            }

            if (!empty($errors)) {
                return back()->withErrors($errors);
            }

            $job->checklist()->update(['content' => $checklist_content]);
        }

        if ($request->has('status')) {
            if ($request->status === 'in_progress' && !$job->started_at && !isset($validated['started_at'])) {
                $validated['started_at'] = now();
            }
            if ($request->status === 'completed' && !$job->completed_at && !isset($validated['completed_at'])) {
                $validated['completed_at'] = now();
            }
        }

        $wasCompleted = $job->status->value !== 'completed' && ($validated['status'] ?? $job->status->value) === 'completed';

        $job->update($validated);

        if ($wasCompleted && $request->boolean('send_sms') && $job->client->phone) {
            app(\App\Services\SMSService::class)->send(
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

        $job->load(['client', 'technician', 'template', 'checklist', 'company']);

        if (!$job->client->email) {
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
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Błąd podczas wysyłki: ' . $e->getMessage()]);
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

    public function destroy(Job $job)
    {
        Gate::authorize('delete', $job);

        $job->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Zlecenie zostało usunięte.']);

        return redirect()->route('jobs.index');
    }
}
