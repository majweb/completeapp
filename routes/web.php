<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TechnicianController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('clients', ClientController::class);
    Route::resource('jobs', JobController::class);
    Route::resource('job-templates', \App\Http\Controllers\JobTemplateController::class);
    Route::resource('technicians', TechnicianController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('jobs/{job}/media', [JobController::class, 'uploadMedia'])->name('jobs.uploadMedia');
    Route::delete('jobs/{job}/media/{media}', [JobController::class, 'deleteMedia'])->name('jobs.deleteMedia');
    Route::post('jobs/{job}/media/reorder', [JobController::class, 'reorderMedia'])->name('jobs.reorderMedia');
    Route::post('jobs/{job}/signature', [JobController::class, 'saveSignature'])->name('jobs.saveSignature');
    Route::get('jobs/{job}/report', [JobController::class, 'downloadReport'])->name('jobs.report');
    Route::post('jobs/{job}/report/send', [JobController::class, 'sendReport'])->name('jobs.sendReport');
});

require __DIR__.'/settings.php';
