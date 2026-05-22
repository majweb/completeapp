<?php

namespace App\Http\Controllers;

use App\Models\JobTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class JobTemplateController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', JobTemplate::class);

        return Inertia::render('job-templates/index', [
            'templates' => auth()->user()->company->jobTemplates()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', JobTemplate::class);

        return Inertia::render('job-templates/create');
    }

    public function store(Request $request)
    {
        Gate::authorize('create', JobTemplate::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array|min:1',
            'structure.*.id' => 'required|string',
            'structure.*.label' => 'required|string',
            'structure.*.type' => 'required|string|in:checkbox,text,number',
            'structure.*.required' => 'required|boolean',
            'require_photo_before' => 'required|boolean',
            'require_photo_after' => 'required|boolean',
            'require_signature' => 'required|boolean',
            'version' => 'required|string',
        ]);

        JobTemplate::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Szablon został utworzony.']);

        return redirect()->route('job-templates.index');
    }

    public function edit(JobTemplate $jobTemplate)
    {
        Gate::authorize('update', $jobTemplate);

        return Inertia::render('job-templates/edit', [
            'template' => $jobTemplate,
        ]);
    }

    public function update(Request $request, JobTemplate $jobTemplate)
    {
        Gate::authorize('update', $jobTemplate);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'structure' => 'required|array|min:1',
            'structure.*.id' => 'required|string',
            'structure.*.label' => 'required|string',
            'structure.*.type' => 'required|string|in:checkbox,text,number',
            'structure.*.required' => 'required|boolean',
            'require_photo_before' => 'required|boolean',
            'require_photo_after' => 'required|boolean',
            'require_signature' => 'required|boolean',
            'version' => 'required|string',
        ]);

        // Jeśli szablon jest już używany w zleceniach, tworzymy nową wersję
        if ($jobTemplate->jobs()->exists()) {
            // Dezaktywujemy stary szablon
            $jobTemplate->update(['is_active' => false]);

            // Tworzymy nową wersję
            $newTemplate = JobTemplate::create(array_merge($validated, [
                'original_id' => $jobTemplate->original_id ?? $jobTemplate->id,
                'company_id' => $jobTemplate->company_id,
                'is_active' => true,
            ]));

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Utworzono nową wersję szablonu.']);
        } else {
            // Jeśli nie jest używany, po prostu aktualizujemy
            $jobTemplate->update($validated);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Szablon został zaktualizowany.']);
        }

        return redirect()->route('job-templates.index');
    }

    public function destroy(JobTemplate $jobTemplate)
    {
        Gate::authorize('delete', $jobTemplate);

        if ($jobTemplate->jobs()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Nie można usunąć szablonu, który jest używany w zleceniach.']);
            return back();
        }

        $jobTemplate->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Szablon został usunięty.']);

        return redirect()->route('job-templates.index');
    }
}
