<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientSignatureController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobTemplateController;
use App\Http\Controllers\PublicJobController;
use App\Http\Controllers\TechnicianController;
use App\Http\Middleware\RedirectAdminToDashboard;
use App\Mail\TestMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Laravel\Cashier\Http\Controllers\WebhookController;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/terms', 'terms')->name('terms');
Route::inertia('/privacy', 'privacy')->name('privacy');

Route::get('auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified', 'no-ssr'])->group(function () {

    Route::middleware([RedirectAdminToDashboard::class])->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::post('clients/import', [ClientController::class, 'import'])->name('clients.import');
        Route::get('clients/template', [ClientController::class, 'downloadTemplate'])->name('clients.template');
        Route::resource('clients', ClientController::class);
        Route::resource('jobs', JobController::class);
        Route::post('jobs/{job}/duplicate', [JobController::class, 'duplicate'])->name('jobs.duplicate');
        Route::post('job-templates/{job_template}/import', [JobTemplateController::class, 'import'])->name('job-templates.import');
        Route::resource('job-templates', JobTemplateController::class);
        Route::resource('technicians', TechnicianController::class);

        Route::post('jobs/{job}/media', [JobController::class, 'uploadMedia'])->name('jobs.uploadMedia');
        Route::delete('jobs/{job}/media/{media}', [JobController::class, 'deleteMedia'])->name('jobs.deleteMedia');
        Route::post('jobs/{job}/media/reorder', [JobController::class, 'reorderMedia'])->name('jobs.reorderMedia');
        Route::post('jobs/{job}/signature', [JobController::class, 'saveSignature'])->name('jobs.saveSignature');
        Route::get('jobs/{job}/report', [JobController::class, 'downloadReport'])->name('jobs.report');
        Route::post('jobs/{job}/report/send', [JobController::class, 'sendReport'])->name('jobs.sendReport');
        Route::post('jobs/{job}/generate-summary', [JobController::class, 'generateSummary'])->name('jobs.generateSummary');
        Route::post('jobs/{job}/request-signature', [JobController::class, 'requestSignature'])->name('jobs.requestSignature');
        Route::post('jobs/{job}/approve', [JobController::class, 'approve'])->name('jobs.approve');

        Route::get('/company/settings', [CompanyController::class, 'edit'])->name('company.edit');
        Route::post('/company/settings', [CompanyController::class, 'update'])->name('company.update');

        // Subscription Management
        Route::get('/subscription', [CompanyController::class, 'subscription'])->name('subscription.index');
        Route::post('/subscription', [CompanyController::class, 'subscribe'])->name('subscription.subscribe');
        Route::get('/subscription/invoices', [CompanyController::class, 'invoices'])->name('subscription.invoices');
        Route::get('/subscription/invoices/{invoice}', [CompanyController::class, 'downloadInvoice'])->name('subscription.invoices.download');

        Route::inertia('/roles-guide', 'roles-guide')->name('roles-guide');
        Route::get('/guide/download', [GuideController::class, 'downloadPdf'])->name('guide.download');

        Route::get('/contact', [ContactController::class, 'show'])->name('contact.show');
        Route::post('/contact', [ContactController::class, 'send'])->name('contact.send');
        Route::get('/contact/captcha-refresh', [ContactController::class, 'refreshCaptcha'])->name('contact.captcha-refresh');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [AdminController::class, 'users'])->name('users');
        Route::get('jobs', [AdminController::class, 'jobs'])->name('jobs');
        Route::post('impersonate/{user}', [AdminController::class, 'impersonate'])->name('impersonate');
        Route::post('users/{user}/toggle-status', [AdminController::class, 'toggleStatus'])->name('users.toggle-status');
    });
    Route::post('stop-impersonating', [AdminController::class, 'stopImpersonating'])->name('admin.stop-impersonating');
});

Route::post('/stripe/webhook', [WebhookController::class, 'handleWebhook']);

Route::get('public/jobs/{job}/signature', [ClientSignatureController::class, 'show'])->name('client.signature.show');
Route::post('public/jobs/{job}/signature', [ClientSignatureController::class, 'store'])->name('client.signature.store');

Route::get('view/job/{job:uuid}', [PublicJobController::class, 'show'])->name('public.job.show');

Route::get('test-mail', function () {
    Mail::to('test@example.com')->send(new TestMail);

    return 'Mail wysłany!';
})->name('test-mail');

require __DIR__.'/settings.php';
