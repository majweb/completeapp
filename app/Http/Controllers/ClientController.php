<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Imports\ClientsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('viewAny', Client::class);

        return Inertia::render('clients/index', [
            'clients' => auth()->user()->clients()
                ->latest()
                ->paginate(6),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Client::class);

        return Inertia::render('clients/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Client::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        Client::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Klient został dodany.']);

        return redirect()->route('clients.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        Gate::authorize('view', $client);

        return Inertia::render('clients/show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        Gate::authorize('update', $client);

        return Inertia::render('clients/edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        Gate::authorize('update', $client);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dane klienta zostały zaktualizowane.']);

        return redirect()->route('clients.index');
    }

    public function import(Request $request)
    {
        Gate::authorize('create', Client::class);

        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:2048',
        ]);

        try {
            Excel::import(new ClientsImport, $request->file('file'));

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Pomyślnie zaimportowano klientów.'
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = "Wiersz {$failure->row()}: " . implode(', ', $failure->errors());
            }

            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "Wystąpiły błędy podczas importu: " . implode('; ', array_slice($errors, 0, 3)) . (count($errors) > 3 ? " i więcej..." : "")
            ]);
        } catch (\Exception $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Błąd importu: ' . $e->getMessage()
            ]);
        }

        return redirect()->route('clients.index');
    }

    public function importCsv(Request $request)
    {
        Gate::authorize('create', Client::class);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        // Skip header
        $header = fgetcsv($handle, 1000, ',');

        $importedCount = 0;
        $errors = [];
        $rowNum = 1;

        while (($data = fgetcsv($handle, 1000, ',')) !== false) {
            $rowNum++;
            // Basic mapping: name, email, phone, address, notes
            if (count($data) < 2) continue;

            $clientData = [
                'name' => $data[0] ?? null,
                'email' => $data[1] ?? null,
                'phone' => $data[2] ?? null,
                'address' => $data[3] ?? null,
                'notes' => $data[4] ?? null,
            ];

            try {
                Client::create($clientData);
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Wiersz {$rowNum}: " . $e->getMessage();
            }
        }

        fclose($handle);

        if (count($errors) > 0) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "Zaimportowano {$importedCount} klientów. Wystąpiły błędy w " . count($errors) . " wierszach."
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Pomyślnie zaimportowano {$importedCount} klientów."
            ]);
        }

        return redirect()->route('clients.index');
    }

    public function downloadTemplate()
    {
        $filePath = public_path('klienci_wzor.csv');

        if (!file_exists($filePath)) {
            abort(404);
        }

        return response()->download($filePath, 'klienci_wzor.csv');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        Gate::authorize('delete', $client);

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Klient został usunięty.']);

        return redirect()->route('clients.index');
    }
}
