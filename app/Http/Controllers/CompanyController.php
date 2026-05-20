<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit()
    {
        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        return Inertia::render('company/edit', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'address' => $company->address,
                'phone' => $company->phone,
                'email' => $company->email,
                'vat_number' => $company->vat_number,
                'primary_color' => $company->primary_color,
                'logo_url' => $company->getFirstMediaUrl('logo'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $company = auth()->user()->company;

        if (auth()->user()->role !== 'owner') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'vat_number' => 'nullable|string|max:50',
            'primary_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'logo' => 'nullable|image|max:2048',
        ], [], [
            'name' => 'nazwa firmy',
            'address' => 'adres',
            'phone' => 'telefon',
            'email' => 'e-mail',
            'vat_number' => 'NIP',
            'primary_color' => 'kolor główny',
            'logo' => 'logo',
        ]);

        $company->update($validated);

        if ($request->boolean('remove_logo')) {
            $company->clearMediaCollection('logo');
        }

        if ($request->hasFile('logo')) {
            $company->clearMediaCollection('logo');
            $company->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ustawienia firmy zostały zaktualizowane.',
        ]);

        return redirect()->back();
    }
}
