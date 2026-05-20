<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Company extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['name', 'slug', 'settings'];

    protected $casts = [
        'settings' => 'json',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
