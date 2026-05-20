<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
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
