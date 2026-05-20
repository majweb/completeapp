<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToCompany;

class Client extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'notes',
        'company_id',
    ];
}
