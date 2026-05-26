<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

use App\Traits\BelongsToCompany;

use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'email', 'password', 'company_id', 'role', 'is_active', 'terms_accepted_at', 'google_id', 'google_token', 'google_refresh_token'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'google_token', 'google_refresh_token'])]
class User extends Authenticatable implements PasskeyUser, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, BelongsToCompany;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'terms_accepted_at' => 'datetime',
        ];
    }

    /**
     * Get the URL for the user's avatar.
     */
    protected function avatarUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function () {
                if ($this->avatar) {
                    return Storage::disk('public')->url($this->avatar);
                }

                if ($this->company_id && $this->company) {
                    return $this->company->getFirstMediaUrl('logo');
                }

                return null;
            },
        );
    }

    /**
     * Get all clients for the company the user belongs to.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class, 'company_id', 'company_id');
    }
}
