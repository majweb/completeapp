<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasFactory, Auditable;

    protected $auditEvents = ['updated', 'deleted'];

    protected $fillable = [
        'job_id',
        'content',
        'is_completed',
    ];

    protected $casts = [
        'content' => 'json',
        'is_completed' => 'boolean',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
