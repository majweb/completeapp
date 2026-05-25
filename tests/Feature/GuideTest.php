<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

test('authenticated user can access roles guide', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('roles-guide'))
        ->assertStatus(200);
});

test('authenticated user can download guide pdf', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('guide.download'))
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});
