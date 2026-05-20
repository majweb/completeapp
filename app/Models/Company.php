<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Company extends Model implements HasMedia
{
    use InteractsWithMedia, HasFactory;

    protected $fillable = ['name', 'slug', 'settings'];

    protected $casts = [
        'settings' => 'json',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function jobTemplates()
    {
        return $this->hasMany(JobTemplate::class);
    }
}
