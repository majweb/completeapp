<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Client;
use App\Enums\JobStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = auth()->user();

        $statsQuery = Job::query();
        $activityQuery = Job::query();
        $recentQuery = Job::query();

        // Jeśli to technik, ograniczamy statystyki do jego zleceń
        if ($user->role === 'technician') {
            $statsQuery->whereRelation('technician', 'id', $user->id);
            $activityQuery->whereRelation('technician', 'id', $user->id);
            $recentQuery->whereRelation('technician', 'id', $user->id);
        }

        $stats = [
            'total_jobs' => (clone $statsQuery)->count(),
            'active_jobs' => (clone $statsQuery)->whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS])->count(),
            'completed_today' => (clone $statsQuery)->where('status', JobStatus::COMPLETED)
                ->whereDate('completed_at', now())
                ->count(),
            'total_clients' => Client::count(), // Klienci pozostają widoczni dla wszystkich (zgodnie z ClientPolicy)
            'jobs_by_status' => (clone $statsQuery)->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->mapWithKeys(fn ($item) => [$item->status->value => $item->count]),
            'latest_job_id' => (clone $statsQuery)->max('id') ?: 0,
        ];

        // Technician specific: next assigned jobs
        $next_jobs = [];
        if ($user->role === 'technician') {
            $next_jobs = (clone $statsQuery)->with('client')
                ->whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS])
                ->orderBy('scheduled_at')
                ->limit(3)
                ->get();
        }

        // Monthly activity data
        $activity_data = $activityQuery->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d.m'),
                'count' => $item->count
            ]);

        $recent_jobs = $recentQuery->with('client', 'template')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activity_data' => $activity_data,
            'recent_jobs' => $recent_jobs,
            'next_jobs' => $next_jobs,
        ]);
    }
}
