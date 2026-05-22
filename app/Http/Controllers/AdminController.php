<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        $this->authorizeAdmin();

        $query = User::with('company');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('company', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role'])
        ]);
    }

    public function jobs(Request $request)
    {
        $this->authorizeAdmin();

        $jobs = Job::with(['company', 'client', 'technician'])->latest()->paginate(20);

        return Inertia::render('admin/jobs', [
            'jobs' => $jobs
        ]);
    }

    public function impersonate(User $user)
    {
        $this->authorizeAdmin();

        if ($user->role === 'admin') {
            return back()->with('error', 'Nie można impersonować innego administratora.');
        }

        $adminId = Auth::id();
        Auth::login($user);
        session()->regenerate();
        session()->put('impersonated_by', $adminId);

        return redirect()->route('dashboard')->with('success', "Zalogowano jako {$user->name}");
    }

    public function toggleStatus(User $user)
    {
        $this->authorizeAdmin();

        if ($user->id === Auth::id()) {
            return back()->with('error', 'Nie możesz zmienić własnego statusu.');
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'aktywowany' : 'dezaktywowany';

        return back()->with('success', "Użytkownik {$user->name} został {$status}.");
    }

    public function stopImpersonating(Request $request)
    {
        $adminId = $request->session()->get('impersonated_by');
        if (! $adminId) {
            return redirect('/dashboard');
        }

        $admin = User::withoutGlobalScopes()->where('id', $adminId)->first();

        if ($admin) {
            Auth::login($admin);
            $request->session()->forget('impersonated_by');
            $request->session()->regenerate();

            return redirect()->route('admin.users')->with('success', 'Wrócono do panelu administratora.');
        }

        return redirect('/dashboard');
    }

    private function authorizeAdmin()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403);
        }
    }
}
