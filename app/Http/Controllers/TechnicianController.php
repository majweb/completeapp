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

            return redirect()->back();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:technician,manager',
            'is_active' => 'boolean',
            'send_credentials' => 'boolean',
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

        return back();
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
