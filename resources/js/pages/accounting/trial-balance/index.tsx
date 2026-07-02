import { TrialBalanceFiltersBar } from '@/components/accounting/trial-balance/trial-balance-filters';
import { TrialBalanceSummary, TrialBalanceTable } from '@/components/accounting/trial-balance/trial-balance-table';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FiscalYearOption } from '@/types/general-ledger';
import type { TrialBalanceFilters, TrialBalanceResult } from '@/types/trial-balance';
import { Head } from '@inertiajs/react';

interface TrialBalanceIndexProps {
    trialBalance: TrialBalanceResult | null;
    fiscalYears: FiscalYearOption[];
    filters: TrialBalanceFilters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Trial Balance', href: route('accounting.trial-balance.index') },
];

export default function TrialBalanceIndex({ trialBalance, fiscalYears, filters }: TrialBalanceIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trial Balance" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={5} />

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Trial Balance</h1>
                    <p className="text-muted-foreground text-sm">
                        Verify that total debits equal total credits — generated from posted journal entries
                    </p>
                </div>

                <TrialBalanceFiltersBar fiscalYears={fiscalYears} filters={filters} />

                {!trialBalance ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center">
                        Select an as-of date, then click <strong>Generate trial balance</strong>.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <TrialBalanceTable lines={trialBalance.lines} />
                        <TrialBalanceSummary
                            totalDebit={trialBalance.total_debit}
                            totalCredit={trialBalance.total_credit}
                            isBalanced={trialBalance.is_balanced}
                            difference={trialBalance.difference}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
