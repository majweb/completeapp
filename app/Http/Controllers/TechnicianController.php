<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\UserCredentialsMail;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TechnicianController extends Controller
{
    public function index(SubscriptionService $subscriptionService)
    {
        Gate::authorize('viewAny', User::class);

        $company = auth()->user()->company;
        $technicians = User::where('company_id', $company->id)
            ->whereIn('role', ['technician', 'manager'])
            ->get();

        $limit = $subscriptionService->getLimit($company, 'technicians');
        $currentCount = $technicians->count();

        return Inertia::render('technicians/index', [
            'technicians' => $technicians,
            'canAddMore' => $currentCount < $limit,
            'limit' => $limit,
            'isFreeMode' => $subscriptionService->isFreeMode(),
        ]);
    }

    public function create(SubscriptionService $subscriptionService)
    {
        Gate::authorize('create', User::class);

        $company = auth()->user()->company;
        $currentCount = User::where('company_id', $company->id)
            ->whereIn('role', ['technician', 'manager'])
            ->count();

        return Inertia::render('technicians/create', [
            'canAddMore' => $currentCount < $subscriptionService->getLimit($company, 'technicians'),
            'limit' => $subscriptionService->getLimit($company, 'technicians'),
        ]);
    }

    public function store(Request $request, SubscriptionService $subscriptionService)
    {
        Gate::authorize('create', User::class);

        $company = auth()->user()->company;
        $currentCount = User::where('company_id', $company->id)
            ->whereIn('role', ['technician', 'manager'])
            ->count();

        if ($currentCount >= $subscriptionService->getLimit($company, 'technicians')) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Osiągnięto limit techników dla Twojego planu.',
            ]);

            return redirect()->route('technicians.index');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:technician,manager',
            'is_active' => 'boolean',
            'send_credentials' => 'boolean',
        ], [], [
            'name' => 'imię i nazwisko',
            'email' => 'adres e-mail',
            'password' => 'hasło',
            'role' => 'rola',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_id' => auth()->user()->company_id,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($request->boolean('send_credentials')) {
            Mail::to($user->email)->send(new UserCredentialsMail($user, $validated['password']));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pracownik został dodany.']);

        return redirect()->route('technicians.index');
    }

    public function edit(User $technician)
    {
        Gate::authorize('update', $technician);

        return Inertia::render('technicians/edit', [
            'technician' => $technician,
        ]);
    }

    public function update(Request $request, User $technician)
    {
        Gate::authorize('update', $technician);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$technician->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:technician,manager',
            'is_active' => 'boolean',
        ], [], [
            'name' => 'imię i nazwisko',
            'email' => 'adres e-mail',
            'password' => 'hasło',
            'role' => 'rola',
        ]);

        $technician->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? $technician->is_active,
        ]);

        if ($request->filled('password')) {
            $technician->update(['password' => Hash::make($validated['password'])]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Dane pracownika zostały zaktualizowane.']);

        return redirect()->route('technicians.index');
    }

    public function destroy(User $technician)
    {
        Gate::authorize('delete', $technician);

        $technician->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Technik został usunięty.']);

        return back();
    }
}
