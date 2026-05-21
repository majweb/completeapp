<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Cashier\Billable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Company extends Model implements HasMedia
{
    use InteractsWithMedia, HasFactory, Billable;

    public function stripeCustomFields(): array
    {
        return [
            'company_id' => $this->id,
        ];
    }

    protected $fillable = [
        'name',
        'slug',
        'address',
        'phone',
        'email',
        'vat_number',
        'primary_color',
        'settings',
    ];

    protected $casts = [
        'settings' => 'json',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('logo');
    }

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
