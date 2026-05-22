<?php

namespace App\Imports;

use App\Models\Client;
use App\Traits\BelongsToCompany;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ClientsImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Client([
            'name'       => $row['nazwa'] ?? $row['name'],
            'email'      => $row['email'],
            'phone'      => $row['telefon'] ?? $row['phone'] ?? null,
            'address'    => $row['adres'] ?? $row['address'] ?? null,
            'notes'      => $row['notatki'] ?? $row['notes'] ?? null,
            'company_id' => auth()->user()->company_id,
        ]);
    }

    public function rules(): array
    {
        return [
            'nazwa' => 'required_without:name|string|max:255',
            'name'  => 'required_without:nazwa|string|max:255',
            'email' => 'required|email|max:255',
        ];
    }
}
