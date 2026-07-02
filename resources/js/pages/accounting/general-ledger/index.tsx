import { LedgerExportBar, LedgerSummary, LedgerTable } from '@/components/accounting/general-ledger/ledger-table';
import { LedgerFilters } from '@/components/accounting/general-ledger/ledger-filters';
import { TAccountView } from '@/components/accounting/t-accounts/t-account-view';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import { AccountTraceLinks } from '@/components/accounting/account-trace-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { financialStatementLabel } from '@/lib/financial-statement-labels';
import { formatBalanceDisplay } from '@/lib/general-ledger-format';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { FiscalYearOption, GeneralLedgerFilters, GeneralLedgerResult, LedgerAccountOption } from '@/types/general-ledger';
import { Head, router, usePage } from '@inertiajs/react';

interface GeneralLedgerIndexProps {
    ledger: GeneralLedgerResult | null;
    accounts: LedgerAccountOption[];
    fiscalYears: FiscalYearOption[];
    filters: GeneralLedgerFilters;
    can: {
        write: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'General Ledger', href: route('accounting.general-ledger.index') },
];

export default function GeneralLedgerIndex({ ledger, accounts, fiscalYears, filters }: GeneralLedgerIndexProps) {
    const { company } = usePage<SharedData>().props;
    const activeView = filters.view ?? 'ledger';

    const setView = (view: 'ledger' | 't-account') => {
        const query: Record<string, string> = {};

        if (filters.account_id) query.account_id = String(filters.account_id);
        if (filters.date_from) query.date_from = filters.date_from;
        if (filters.date_to) query.date_to = filters.date_to;
        if (filters.fiscal_year_id) query.fiscal_year_id = String(filters.fiscal_year_id);
        query.view = view;

        router.get(route('accounting.general-ledger.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Ledger" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={4} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">General Ledger</h1>
                        <p className="text-muted-foreground text-sm">
                            Account activity for {company?.current?.name ?? 'your company'} — generated from posted journal entries
                        </p>
                    </div>
                    <LedgerExportBar disabled={ledger === null} />
                </div>

                <LedgerFilters accounts={accounts} fiscalYears={fiscalYears} filters={filters} />

                {!ledger ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center">
                        Select an account and date range, then click <strong>Generate ledger</strong>.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-mono text-lg font-semibold">
                                        {ledger.account.account_code} — {ledger.account.account_name}
                                    </p>
                                    <p className="text-muted-foreground text-sm capitalize">
                                        {ledger.account.account_type.replace('_', ' ')} · Normal balance:{' '}
                                        {ledger.account.normal_balance.toUpperCase()}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Appears on: {financialStatementLabel(ledger.account.account_type)}
                                    </p>
                                    <AccountTraceLinks
                                        accountId={ledger.account.id}
                                        accountType={ledger.account.account_type}
                                        dateFrom={filters.date_from}
                                        dateTo={filters.date_to}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">{ledger.account.account_type}</Badge>
                                    {ledger.account.is_header && <Badge variant="secondary">Header</Badge>}
                                    {ledger.includes_descendants && <Badge variant="outline">Includes descendants</Badge>}
                                </div>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Opening balance</p>
                                    <p className="font-mono text-base font-medium">
                                        {formatBalanceDisplay(ledger.opening_balance_amount, ledger.opening_balance_side)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Period</p>
                                    <p className="text-sm">
                                        {filters.date_from} to {filters.date_to}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 print:hidden">
                            <Button
                                type="button"
                                variant={activeView === 'ledger' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setView('ledger')}
                            >
                                General Ledger
                            </Button>
                            <Button
                                type="button"
                                variant={activeView === 't-account' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setView('t-account')}
                            >
                                T-Account View
                            </Button>
                        </div>

                        {activeView === 't-account' ? (
                            <TAccountView ledger={ledger} />
                        ) : (
                            <>
                                <LedgerTable lines={ledger.lines} />
                                <LedgerSummary
                                    totalDebit={ledger.total_debit}
                                    totalCredit={ledger.total_credit}
                                    closingBalanceAmount={ledger.closing_balance_amount}
                                    closingBalanceSide={ledger.closing_balance_side}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
