<?php

use App\Http\Controllers\FinancialAnalysisController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'company.selected'])
    ->prefix('financial-analysis')
    ->name('financial-analysis.')
    ->group(function () {
        Route::get('dashboard', [FinancialAnalysisController::class, 'dashboard'])
            ->name('dashboard');

        Route::get('profitability', [FinancialAnalysisController::class, 'profitability'])
            ->name('profitability');

        Route::get('liquidity', [FinancialAnalysisController::class, 'liquidity'])
            ->name('liquidity');

        Route::get('solvency', [FinancialAnalysisController::class, 'solvency'])
            ->name('solvency');

        Route::get('efficiency', [FinancialAnalysisController::class, 'efficiency'])
            ->name('efficiency');

        Route::get('trends', [FinancialAnalysisController::class, 'trends'])
            ->name('trends');

        Route::get('insights', [FinancialAnalysisController::class, 'insights'])
            ->name('insights');
    });
