<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCompany;

class JobTemplate extends Model
{
    use BelongsToCompany, HasFactory;

    protected $fillable = [
        'name',
        'description',
        'structure',
        'require_photo_before',
        'require_photo_after',
        'require_signature',
        'version',
        'company_id',
        'original_id',
        'is_active',
    ];

    protected $casts = [
        'structure' => 'json',
        'require_photo_before' => 'boolean',
        'require_photo_after' => 'boolean',
        'require_signature' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function original()
    {
        return $this->belongsTo(JobTemplate::class, 'original_id');
    }

    public function versions()
    {
        return $this->hasMany(JobTemplate::class, 'original_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'template_id');
    }

    public function generateChecklist(Job $job): Checklist
    {
        return Checklist::create([
            'job_id' => $job->id,
            'content' => collect($this->structure)->map(function ($field) {
                return array_merge($field, ['value' => null]);
            })->toArray(),
        ]);
    }
}
