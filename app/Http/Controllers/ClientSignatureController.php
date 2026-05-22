<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\JobStatus;

class ClientSignatureController extends Controller
{
    public function show(Request $request, Job $job)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Link wygasł lub jest nieprawidłowy.');
        }

        if (!$job->isReadyForSignature()) {
            abort(403, 'Zlecenie nie jest jeszcze gotowe do podpisu. Technik musi uzupełnić wymagane informacje.');
        }

        return Inertia::render('client/signature', [
            'job' => $job->load(['client', 'technician', 'template', 'company', 'checklist']),
            'media' => [
                'before' => $job->getMedia('images_before')->map(fn($m) => ['id' => $m->id, 'url' => $m->getUrl()]),
                'after' => $job->getMedia('images_after')->map(fn($m) => ['id' => $m->id, 'url' => $m->getUrl()]),
            ]
        ]);
    }

    public function store(Request $request, Job $job)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Link wygasł lub jest nieprawidłowy.');
        }

        $request->validate([
            'signature' => 'required|string',
        ]);

        $job->addMediaFromBase64($request->signature)
            ->usingFileName("signature_{$job->id}.png")
            ->toMediaCollection('signature');

        $job->update([
            'completed_at' => now(),
            'status' => JobStatus::COMPLETED,
        ]);

        return back()->with('success', 'Podpis został zapisany. Dziękujemy!');
    }
}
