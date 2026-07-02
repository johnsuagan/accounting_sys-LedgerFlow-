import { TAccountFiltersBar } from '@/components/accounting/t-accounts/t-account-filters';
import { TAccountList } from '@/components/accounting/t-accounts/t-account-list';
import { TAccountView } from '@/components/accounting/t-accounts/t-account-view';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FiscalYearOption, GeneralLedgerResult, LedgerAccountOption } from '@/types/general-ledger';
import type { TAccountAccountSummary } from '@/types/financial-statements';
import { Head } from '@inertiajs/react';

interface TAccountsIndexProps {
    ledger: GeneralLedgerResult | null;
    accountSummaries: TAccountAccountSummary[] | null;
    accounts: LedgerAccountOption[];
    fiscalYears: FiscalYearOption[];
    filters: {
        account_id: number | null;
        date_from: string;
        date_to: string;
        fiscal_year_id: number | null;
        account_type?: string;
    };
    accountTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'T-Accounts', href: route('accounting.t-accounts.index') },
];

export default function TAccountsIndex({
    ledger,
    accountSummaries,
    accounts,
    fiscalYears,
    filters,
    accountTypes,
}: TAccountsIndexProps) {
    const hasDateRange = Boolean(filters.date_from && filters.date_to);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="T-Accounts" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={3} />

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">T-Accounts</h1>
                    <p className="text-muted-foreground text-sm">
                        Read-only T-Accounts generated from posted journal entries
                    </p>
                </div>

                <TAccountFiltersBar
                    accounts={accounts}
                    fiscalYears={fiscalYears}
                    filters={filters}
                    accountTypes={accountTypes}
                />

                {ledger ? (
                    <TAccountView ledger={ledger} />
                ) : hasDateRange && accountSummaries ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Accounts</h2>
                        <TAccountList summaries={accountSummaries} dateFrom={filters.date_from} dateTo={filters.date_to} />
                    </div>
                ) : (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center">
                        Set a date range and click <strong>Browse accounts</strong>, or select an account and click{' '}
                        <strong>View T-Account</strong>.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
