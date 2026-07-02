import { StatementSection } from '@/components/accounting/financial-statements/statement-section';
import {
    ChangesInEquityView,
    GroupedStatementSections,
} from '@/components/accounting/financial-statements/grouped-statement-sections';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatLedgerAmount } from '@/lib/general-ledger-format';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FiscalYearOption } from '@/types/general-ledger';
import type {
    BalanceSheetResult,
    ChangesInEquityResult,
    FinancialStatementFilters,
    IncomeStatementResult,
} from '@/types/financial-statements';
import { Head, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinancialStatementsIndexProps {
    incomeStatement: IncomeStatementResult | null;
    balanceSheet: BalanceSheetResult | null;
    changesInEquity: ChangesInEquityResult | null;
    fiscalYears: FiscalYearOption[];
    filters: FinancialStatementFilters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Statements', href: route('accounting.financial-statements.index') },
];

type StatementType = FinancialStatementFilters['statement'];

export default function FinancialStatementsIndex({
    incomeStatement,
    balanceSheet,
    changesInEquity,
    fiscalYears,
    filters,
}: FinancialStatementsIndexProps) {
    const [statement, setStatement] = useState<StatementType>(filters.statement);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [asOfDate, setAsOfDate] = useState(filters.as_of_date);
    const [fiscalYearId, setFiscalYearId] = useState(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');

    useEffect(() => {
        setStatement(filters.statement);
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
        setAsOfDate(filters.as_of_date);
        setFiscalYearId(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');
    }, [filters]);

    const apply = () => {
        const query: Record<string, string> = { statement };

        if (statement === 'balance_sheet') {
            if (!asOfDate) return;
            query.as_of_date = asOfDate;
        } else {
            if (!dateFrom || !dateTo) return;
            query.date_from = dateFrom;
            query.date_to = dateTo;
        }

        if (fiscalYearId !== 'all') query.fiscal_year_id = fiscalYearId;

        router.get(route('accounting.financial-statements.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clear = () => {
        router.get(route('accounting.financial-statements.index'), {}, { preserveState: true, replace: true });
    };

    const switchStatement = (next: StatementType) => {
        setStatement(next);
        router.get(route('accounting.financial-statements.index'), { statement: next }, { preserveState: true, replace: true });
    };

    const hasResult =
        (statement === 'income_statement' && incomeStatement !== null) ||
        (statement === 'balance_sheet' && balanceSheet !== null) ||
        (statement === 'changes_in_equity' && changesInEquity !== null);

    const needsPeriod = statement !== 'balance_sheet';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Statements" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={6} />

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Financial Statements</h1>
                    <p className="text-muted-foreground text-sm">Auto-generated from posted journal entries</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            ['balance_sheet', 'Statement of Financial Position'],
                            ['income_statement', 'Income Statement'],
                            ['changes_in_equity', 'Changes in Equity'],
                        ] as const
                    ).map(([key, label]) => (
                        <Button
                            key={key}
                            type="button"
                            variant={statement === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchStatement(key)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-4">
                    {needsPeriod ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="fs-date-from">Date from</Label>
                                <Input id="fs-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fs-date-to">Date to</Label>
                                <Input id="fs-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="fs-as-of-date">As of date</Label>
                            <Input id="fs-as-of-date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Fiscal year (optional)</Label>
                        <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All fiscal years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All fiscal years</SelectItem>
                                {fiscalYears.map((year) => (
                                    <SelectItem key={year.id} value={String(year.id)}>
                                        {year.name} ({year.year})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-2 lg:col-span-2">
                        <Button type="button" onClick={apply}>
                            <Search className="mr-2 h-4 w-4" />
                            Generate statement
                        </Button>
                        <Button type="button" variant="outline" onClick={clear}>
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>

                {!hasResult ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center">
                        Configure dates and click <strong>Generate statement</strong>.
                    </div>
                ) : statement === 'balance_sheet' && balanceSheet ? (
                    <div className="mx-auto w-full max-w-2xl space-y-6 rounded-xl border bg-card p-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Statement of Financial Position</h2>
                            <p className="text-muted-foreground text-sm">As of {balanceSheet.filters.as_of_date}</p>
                        </div>
                        <div>
                            <h3 className="mb-3 font-semibold">Assets</h3>
                            <GroupedStatementSections sections={balanceSheet.asset_sections} />
                            <p className="mt-2 flex justify-between font-bold">
                                <span>Total Assets</span>
                                <span className="font-mono">{formatLedgerAmount(balanceSheet.total_assets)}</span>
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-3 font-semibold">Liabilities</h3>
                            <GroupedStatementSections sections={balanceSheet.liability_sections} />
                            <p className="mt-2 flex justify-between font-bold">
                                <span>Total Liabilities</span>
                                <span className="font-mono">{formatLedgerAmount(balanceSheet.total_liabilities)}</span>
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-3 font-semibold">Equity</h3>
                            <GroupedStatementSections sections={balanceSheet.equity_sections} />
                            <p className="mt-2 flex justify-between font-bold">
                                <span>Total Equity</span>
                                <span className="font-mono">{formatLedgerAmount(balanceSheet.total_equity)}</span>
                            </p>
                        </div>
                        <div className="flex justify-between border-t-2 pt-3 font-bold">
                            <span>Total Liabilities & Equity</span>
                            <span className="font-mono">{formatLedgerAmount(balanceSheet.total_liabilities_and_equity)}</span>
                        </div>
                    </div>
                ) : statement === 'income_statement' && incomeStatement ? (
                    <div className="mx-auto w-full max-w-2xl space-y-6 rounded-xl border bg-card p-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Income Statement</h2>
                            <p className="text-muted-foreground text-sm">
                                {incomeStatement.filters.date_from} to {incomeStatement.filters.date_to}
                            </p>
                        </div>
                        <StatementSection
                            title="Revenue"
                            lines={incomeStatement.revenue_lines}
                            total={incomeStatement.total_revenue}
                            totalLabel="Total Revenue"
                        />
                        <StatementSection
                            title="Expenses"
                            lines={incomeStatement.expense_lines}
                            total={incomeStatement.total_expenses}
                            totalLabel="Total Expenses"
                        />
                        <div className="flex justify-between border-t-2 pt-3 text-lg font-bold">
                            <span>{incomeStatement.is_net_loss ? 'Net Loss' : 'Net Income'}</span>
                            <span className="font-mono">{formatLedgerAmount(incomeStatement.net_income)}</span>
                        </div>
                    </div>
                ) : changesInEquity ? (
                    <div className="mx-auto w-full max-w-2xl space-y-4">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Statement of Changes in Equity</h2>
                            <p className="text-muted-foreground text-sm">
                                {changesInEquity.filters.date_from} to {changesInEquity.filters.date_to}
                            </p>
                        </div>
                        <ChangesInEquityView
                            beginningCapital={changesInEquity.beginning_capital}
                            netIncome={changesInEquity.net_income}
                            withdrawals={changesInEquity.withdrawals}
                            endingCapital={changesInEquity.ending_capital}
                            isNetLoss={changesInEquity.is_net_loss}
                        />
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
