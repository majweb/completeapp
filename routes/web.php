<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TechnicianController;
use App\Http\Controllers\JobTemplateController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::post('clients/import', [ClientController::class, 'import'])->name('clients.import');
    Route::get('clients/template', [ClientController::class, 'downloadTemplate'])->name('clients.template');
    Route::resource('clients', ClientController::class);
    Route::resource('jobs', JobController::class);
    Route::resource('job-templates', JobTemplateController::class);
    Route::resource('technicians', TechnicianController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::post('jobs/{job}/media', [JobController::class, 'uploadMedia'])->name('jobs.uploadMedia');
    Route::delete('jobs/{job}/media/{media}', [JobController::class, 'deleteMedia'])->name('jobs.deleteMedia');
    Route::post('jobs/{job}/media/reorder', [JobController::class, 'reorderMedia'])->name('jobs.reorderMedia');
    Route::post('jobs/{job}/signature', [JobController::class, 'saveSignature'])->name('jobs.saveSignature');
    Route::get('jobs/{job}/report', [JobController::class, 'downloadReport'])->name('jobs.report');
    Route::post('jobs/{job}/report/send', [JobController::class, 'sendReport'])->name('jobs.sendReport');
    Route::post('jobs/{job}/generate-summary', [JobController::class, 'generateSummary'])->name('jobs.generateSummary');

    Route::get('/company/settings', [CompanyController::class, 'edit'])->name('company.edit');
    Route::post('/company/settings', [CompanyController::class, 'update'])->name('company.update');

    // Subscription Management
    Route::get('/subscription', [CompanyController::class, 'subscription'])->name('subscription.index');
    Route::post('/subscription', [CompanyController::class, 'subscribe'])->name('subscription.subscribe');
    Route::get('/subscription/invoices', [CompanyController::class, 'invoices'])->name('subscription.invoices');
    Route::get('/subscription/invoices/{invoice}', [CompanyController::class, 'downloadInvoice'])->name('subscription.invoices.download');
});

Route::post('/stripe/webhook', [\Laravel\Cashier\Http\Controllers\WebhookController::class, 'handleWebhook']);

require __DIR__.'/settings.php';
