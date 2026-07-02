<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\FinancialStatementController;
use App\Http\Controllers\GeneralLedgerController;
use App\Http\Controllers\JournalEntryAttachmentController;
use App\Http\Controllers\JournalEntryController;
use App\Http\Controllers\TAccountController;
use App\Http\Controllers\TrialBalanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'company.selected'])
    ->prefix('accounting')
    ->name('accounting.')
    ->group(function () {
        Route::resource('accounts', AccountController::class)->except(['show']);

        Route::patch('accounts/{account}/deactivate', [AccountController::class, 'deactivate'])
            ->name('accounts.deactivate');

        Route::patch('accounts/{account}/activate', [AccountController::class, 'activate'])
            ->name('accounts.activate');

        Route::resource('journal-entries', JournalEntryController::class)
            ->parameters(['journal-entries' => 'journal_entry']);

        Route::post('journal-entries/{journal_entry}/post', [JournalEntryController::class, 'post'])
            ->name('journal-entries.post');

        Route::post('journal-entries/{journal_entry}/cancel', [JournalEntryController::class, 'cancel'])
            ->name('journal-entries.cancel');

        Route::post('journal-entries/{journal_entry}/reverse', [JournalEntryController::class, 'reverse'])
            ->name('journal-entries.reverse');

        Route::post('journal-entries/{journal_entry}/attachments', [JournalEntryAttachmentController::class, 'store'])
            ->name('journal-entries.attachments.store');

        Route::delete('journal-entries/{journal_entry}/attachments/{attachment}', [JournalEntryAttachmentController::class, 'destroy'])
            ->name('journal-entries.attachments.destroy');

        Route::get('general-ledger', [GeneralLedgerController::class, 'index'])
            ->name('general-ledger.index');

        Route::get('t-accounts', [TAccountController::class, 'index'])
            ->name('t-accounts.index');

        Route::get('trial-balance', [TrialBalanceController::class, 'index'])
            ->name('trial-balance.index');

        Route::get('financial-statements', [FinancialStatementController::class, 'index'])
            ->name('financial-statements.index');

        Route::get('audit-trail', [AuditLogController::class, 'index'])
            ->name('audit-trail.index');
    });
