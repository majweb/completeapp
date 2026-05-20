<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class TechnicianController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', User::class);

        $technicians = User::where('company_id', auth()->user()->company_id)
            ->whereIn('role', ['technician', 'manager'])
            ->get();

        return Inertia::render('technicians/index', [
            'technicians' => $technicians
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:technician,manager',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_id' => auth()->user()->company_id,
            'role' => $validated['role'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pracownik został dodany.']);

        return back();
    }

    public function update(Request $request, User $technician)
    {
        Gate::authorize('update', $technician);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $technician->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:technician,manager',
        ]);

        $technician->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        if ($request->filled('password')) {
            $technician->update(['password' => Hash::make($validated['password'])]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dane pracownika zostały zaktualizowane.']);

        return back();
    }

    public function destroy(User $technician)
    {
        Gate::authorize('delete', $technician);

        $technician->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Technik został usunięty.']);

        return back();
    }
}
