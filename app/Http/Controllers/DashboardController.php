<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Models\Client;
use App\Models\Job;
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
            'completed_today' => (clone $statsQuery)->whereIn('status', [JobStatus::COMPLETED, JobStatus::APPROVED])
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
        $route_jobs = [];
        if ($user->role === 'technician') {
            $next_jobs = (clone $statsQuery)->with('client')
                ->whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS])
                ->orderBy('scheduled_at')
                ->limit(3)
                ->get();

            // Jobs for today's route
            $route_jobs = Job::query()
                ->with('client:id,name,address,latitude,longitude')
                ->whereRelation('technician', 'id', $user->id)
                ->whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS, JobStatus::COMPLETED])
                ->whereDate('scheduled_at', now())
                ->whereHas('client', function ($query) {
                    $query->whereNotNull('latitude')->whereNotNull('longitude');
                })
                ->orderBy('scheduled_at')
                ->get()
                ->map(fn ($job) => [
                    'id' => $job->id,
                    'status' => $job->status->value,
                    'status_label' => $job->status->label(),
                    'client_name' => $job->client->name,
                    'address' => $job->client->address,
                    'latitude' => (float) $job->client->latitude,
                    'longitude' => (float) $job->client->longitude,
                    'scheduled_at' => $job->scheduled_at->format('H:i'),
                ]);
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
            ->map(fn ($item) => [
                'date' => Carbon::parse($item->date)->format('d.m'),
                'count' => $item->count,
            ]);

        $recent_jobs = $recentQuery->with('client', 'template')
            ->latest()
            ->limit(5)
            ->get();

        // Jobs for map (Manager/Owner only)
        $map_jobs = [];
        if ($user->role === 'owner' || $user->role === 'manager') {
            $map_jobs = Job::query()
                ->with(['client:id,name,address,latitude,longitude', 'technician:id,name'])
                ->whereIn('status', [JobStatus::NEW, JobStatus::IN_PROGRESS])
                ->whereHas('client', function ($query) {
                    $query->whereNotNull('latitude')->whereNotNull('longitude');
                })
                ->get()
                ->map(fn ($job) => [
                    'id' => $job->id,
                    'status' => $job->status->value,
                    'status_label' => $job->status->label(),
                    'client_name' => $job->client->name,
                    'address' => $job->client->address,
                    'latitude' => (float) $job->client->latitude,
                    'longitude' => (float) $job->client->longitude,
                    'technician_name' => $job->technician?->name ?? 'Nieprzypisane',
                    'scheduled_at' => $job->scheduled_at?->format('H:i'),
                ]);
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activity_data' => $activity_data,
            'recent_jobs' => $recent_jobs,
            'next_jobs' => $next_jobs,
            'route_jobs' => $route_jobs,
            'map_jobs' => $map_jobs,
        ]);
    }
}
