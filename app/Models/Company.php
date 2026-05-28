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

    protected static function booted()
    {
        static::deleting(function ($company) {
            // Jawnie usuwamy powiązane modele, aby wyzwolić ich eventy (np. usuwanie mediów, audytów)
            // i upewnić się, że wszystko zostanie usunięte nawet jeśli kaskada bazy danych zawiedzie.
            $company->jobs()->each(fn ($job) => $job->delete());
            $company->jobTemplates()->each(fn ($template) => $template->delete());
            $company->clients()->each(fn ($client) => $client->delete());
            $company->users()->each(fn ($user) => $user->delete());
        });
    }

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
        'is_demo',
    ];

    protected $casts = [
        'settings' => 'json',
        'is_demo' => 'boolean',
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
