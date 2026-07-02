<?php

namespace App\Providers;

use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\AccountingPeriodRepositoryInterface;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use App\Repositories\Contracts\CompanyUserRepositoryInterface;
use App\Repositories\Contracts\FiscalYearRepositoryInterface;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use App\Repositories\Eloquent\AccountRepository;
use App\Repositories\Eloquent\AccountingPeriodRepository;
use App\Repositories\Eloquent\AuditLogRepository;
use App\Repositories\Eloquent\CompanyRepository;
use App\Repositories\Eloquent\CompanyUserRepository;
use App\Repositories\Eloquent\FiscalYearRepository;
use App\Repositories\Eloquent\JournalEntryRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CompanyRepositoryInterface::class, CompanyRepository::class);
        $this->app->bind(CompanyUserRepositoryInterface::class, CompanyUserRepository::class);
        $this->app->bind(AccountRepositoryInterface::class, AccountRepository::class);
        $this->app->bind(FiscalYearRepositoryInterface::class, FiscalYearRepository::class);
        $this->app->bind(AccountingPeriodRepositoryInterface::class, AccountingPeriodRepository::class);
        $this->app->bind(JournalEntryRepositoryInterface::class, JournalEntryRepository::class);
        $this->app->bind(AuditLogRepositoryInterface::class, AuditLogRepository::class);
    }

    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            if ($user?->isSuperAdmin()) {
                return true;
            }

            return null;
        });
    }
}
