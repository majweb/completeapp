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

        $templates = JobTemplate::withGlobal()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('job-templates/index', [
            'myTemplates' => $templates->filter(fn ($t) => $t->company_id !== null)->values(),
            'globalTemplates' => $templates->filter(fn ($t) => $t->company_id === null)
                ->groupBy('category')
                ->map(fn ($group) => $group->values()),
        ]);
    }

    public function import(int $id)
    {
        if (auth()->user()->is_demo) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Importowanie szablonów jest zablokowane w wersji demo.',
            ]);

            return back();
        }

        $jobTemplate = JobTemplate::withoutGlobalScopes()
            ->whereNull('company_id')
            ->findOrFail($id);

        Gate::authorize('create', JobTemplate::class);

        if ($jobTemplate->company_id !== null) {
            abort(403, 'Można importować tylko szablony globalne.');
        }

        // Sprawdzamy czy firma już nie zaimportowała tego szablonu
        $exists = JobTemplate::where('company_id', auth()->user()->company_id)
            ->where('original_id', $jobTemplate->id)
            ->exists();

        if ($exists) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'Ten szablon został już zaimportowany.']);

            return back();
        }

        $newTemplate = $jobTemplate->replicate();
        $newTemplate->company_id = auth()->user()->company_id;
        $newTemplate->original_id = $jobTemplate->id;
        $newTemplate->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Szablon został dodany do Twojej firmy.']);

        return redirect()->route('job-templates.index');
    }

    public function create()
    {
        Gate::authorize('create', JobTemplate::class);

        return Inertia::render('job-templates/create');
    }

    public function store(Request $request)
    {
        if (auth()->user()->is_demo) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Tworzenie szablonów jest zablokowane w wersji demo.',
            ]);

            return back();
        }

        Gate::authorize('create', JobTemplate::class);

        $attributes = [];
        foreach ($request->input('structure', []) as $index => $field) {
            $attributes["structure.{$index}.label"] = 'etykieta pola '.($index + 1);
            $attributes["structure.{$index}.type"] = 'typ pola '.($index + 1);
            $attributes["structure.{$index}.required"] = 'wymagalność pola '.($index + 1);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'structure' => 'required|array|min:1',
            'structure.*.id' => 'required|string',
            'structure.*.label' => 'required|string|max:50',
            'structure.*.type' => 'required|string|in:checkbox,text,number',
            'structure.*.required' => 'required|boolean',
            'require_photo_before' => 'required|boolean',
            'require_photo_after' => 'required|boolean',
            'require_signature' => 'required|boolean',
            'version' => 'required|string',
        ], [], $attributes);

        JobTemplate::create(array_merge($validated, [
            'company_id' => auth()->user()->company_id,
        ]));

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

        $attributes = [];
        foreach ($request->input('structure', []) as $index => $field) {
            $attributes["structure.{$index}.label"] = 'etykieta pola '.($index + 1);
            $attributes["structure.{$index}.type"] = 'typ pola '.($index + 1);
            $attributes["structure.{$index}.required"] = 'wymagalność pola '.($index + 1);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'structure' => 'required|array|min:1',
            'structure.*.id' => 'required|string',
            'structure.*.label' => 'required|string|max:50',
            'structure.*.type' => 'required|string|in:checkbox,text,number',
            'structure.*.required' => 'required|boolean',
            'require_photo_before' => 'required|boolean',
            'require_photo_after' => 'required|boolean',
            'require_signature' => 'required|boolean',
            'version' => 'required|string',
        ], [], $attributes);

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
