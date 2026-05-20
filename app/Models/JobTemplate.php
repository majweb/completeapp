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
        'version',
        'company_id',
    ];

    protected $casts = [
        'structure' => 'json',
    ];

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
