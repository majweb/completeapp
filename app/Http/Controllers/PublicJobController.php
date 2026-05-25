<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicJobController extends Controller
{
    public function show(Job $job)
    {
        $job->load(['client', 'technician', 'template', 'checklist', 'company']);

        return Inertia::render('public/job-view', [
            'job' => array_merge($job->toArray(), [
                'media' => [
                    'before' => $job->getMedia('images_before')->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->getUrl('large'),
                    ]),
                    'after' => $job->getMedia('images_after')->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $m->getUrl('large'),
                    ]),
                    'signature' => $job->getFirstMediaUrl('signature'),
                    'logo_url' => $job->company->logo_url,
                ],
            ]),
        ]);
    }
}
