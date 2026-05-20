<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Client;
use App\Enums\JobStatus;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $stats = [
            'total_jobs' => Job::count(),
            'active_jobs' => Job::whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS])->count(),
            'completed_today' => Job::where('status', JobStatus::COMPLETED)
                ->whereDate('completed_at', now())
                ->count(),
            'total_clients' => Client::count(),
            'jobs_by_status' => Job::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->mapWithKeys(fn ($item) => [$item->status->value => $item->count]),
        ];

        $recent_jobs = Job::with('client', 'template')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recent_jobs' => $recent_jobs,
        ]);
    }
}
