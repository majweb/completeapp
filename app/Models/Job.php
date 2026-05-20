<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Enums\JobStatus;
use App\Traits\BelongsToCompany;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Job extends Model implements HasMedia
{
    use InteractsWithMedia, BelongsToCompany;

    protected $table = 'work_jobs';

    protected $fillable = [
        'company_id',
        'client_id',
        'assigned_to',
        'template_id',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'report_summary',
    ];

    protected $casts = [
        'status' => JobStatus::class,
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function template()
    {
        return $this->belongsTo(JobTemplate::class, 'template_id');
    }

    public function checklist()
    {
        return $this->hasOne(Checklist::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images_before');
        $this->addMediaCollection('images_after');
        $this->addMediaCollection('problems');
        $this->addMediaCollection('signature')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(1200)
            ->nonQueued();
    }
}
