<?php

use App\Http\Controllers\CompanySwitchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('company/select', [CompanySwitchController::class, 'index'])->name('company.select');
    Route::post('company/select', [CompanySwitchController::class, 'store'])->name('company.switch');
    Route::delete('company/select', [CompanySwitchController::class, 'destroy'])->name('company.clear');
});

Route::middleware(['auth', 'company.selected'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/accounting.php';
require __DIR__.'/financial-analysis.php';
