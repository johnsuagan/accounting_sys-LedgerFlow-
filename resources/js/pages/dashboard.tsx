import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import { TrendBarChart } from '@/components/accounting/dashboard/trend-bar-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { accountTypeLabels } from '@/lib/accounting-labels';
import { formatLedgerAmount } from '@/lib/general-ledger-format';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Gauge,
    BookOpen,
    BookText,
    FileSpreadsheet,
    ListTree,
    Scale,
    ScrollText,
    SplitSquareHorizontal,
    TrendingUp,
} from 'lucide-react';

interface DashboardAnalytics {
    summary: {
        total_assets: string;
        total_liabilities: string;
        total_equity: string;
        total_revenue: string;
        total_expenses: string;
        net_income: string;
        as_of_date: string;
    };
    trends: Array<{
        period: string;
        revenue: string;
        expenses: string;
        net_income: string;
    }>;
    account_balance_summary: Array<{
        account_type: string;
        total: string;
    }>;
    recent_journal_entries: Array<{
        id: number;
        entry_number: string | null;
        entry_date: string;
        description: string;
        status: string;
        total_debit: string;
        posted_at: string | null;
    }>;
}

interface DashboardProps {
    showWelcome: boolean;
    practiceSet: {
        name: string | null;
        isEducational: boolean;
    };
    analytics: DashboardAnalytics | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const summaryCards = [
    { key: 'total_assets', label: 'Total Assets', icon: ListTree },
    { key: 'total_liabilities', label: 'Total Liabilities', icon: Scale },
    { key: 'total_equity', label: 'Total Equity', icon: BookOpen },
    { key: 'total_revenue', label: 'Total Revenue', icon: TrendingUp },
    { key: 'total_expenses', label: 'Total Expenses', icon: BookText },
    { key: 'net_income', label: 'Net Income', icon: FileSpreadsheet },
] as const;

export default function Dashboard({ showWelcome, practiceSet, analytics }: DashboardProps) {
    const { flash, company } = usePage<SharedData>().props;
    const displayWelcome = showWelcome || flash?.welcome;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {(displayWelcome || practiceSet.isEducational) && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                            <CardTitle className="text-2xl">LedgerFlow</CardTitle>
                            <CardDescription className="text-base">
                                Professional Accounting Information System for Accounting Students
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {practiceSet.name ?? company?.current?.name ?? 'Your practice set'} is ready. Work through
                                the accounting cycle — from journal entries to financial statements — using the same
                                workflow used in practice.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <AccountingWorkflow />

                {analytics && (
                    <>
                        <div>
                            <h2 className="mb-1 text-lg font-semibold">Financial position</h2>
                            <p className="text-muted-foreground text-sm">As of {analytics.summary.as_of_date}</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {summaryCards.map(({ key, label, icon: Icon }) => (
                                <Card key={key}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                        <Icon className="text-muted-foreground h-4 w-4" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-mono text-2xl font-bold">
                                            {formatLedgerAmount(analytics.summary[key])}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendBarChart data={analytics.trends} metric="revenue" label="Monthly revenue" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expense trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendBarChart data={analytics.trends} metric="expenses" label="Monthly expenses" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Net income trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TrendBarChart data={analytics.trends} metric="net_income" label="Monthly net income" />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent posted transactions</CardTitle>
                                    <CardDescription>Latest journal entries affecting your reports</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {analytics.recent_journal_entries.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No posted entries yet.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {analytics.recent_journal_entries.map((entry) => (
                                                <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
                                                    <div>
                                                        <Link
                                                            href={route('accounting.journal-entries.show', entry.id)}
                                                            className="text-primary font-mono hover:underline"
                                                        >
                                                            {entry.entry_number ?? `JE-${entry.id}`}
                                                        </Link>
                                                        <p className="line-clamp-1">{entry.description}</p>
                                                        <p className="text-muted-foreground text-xs">{entry.entry_date}</p>
                                                    </div>
                                                    <span className="font-mono text-xs">{formatLedgerAmount(entry.total_debit)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Account balance summary</CardTitle>
                                    <CardDescription>Totals by account type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {analytics.account_balance_summary.map((item) => (
                                            <li key={item.account_type} className="flex justify-between text-sm">
                                                <span>
                                                    {accountTypeLabels[item.account_type as keyof typeof accountTypeLabels]}
                                                </span>
                                                <span className="font-mono font-medium">{formatLedgerAmount(item.total)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Quick actions</CardTitle>
                        <CardDescription>Jump into the accounting cycle</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Button asChild className="h-auto justify-start py-4">
                            <Link href={route('accounting.journal-entries.create')}>
                                <BookText className="mr-3 h-5 w-5" />
                                Create journal entry
                                <ArrowRight className="ml-2 inline h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('accounting.accounts.index')}>
                                <ListTree className="mr-3 h-5 w-5" />
                                Chart of accounts
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('accounting.t-accounts.index')}>
                                <SplitSquareHorizontal className="mr-3 h-5 w-5" />
                                T-Accounts
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('accounting.general-ledger.index')}>
                                <ScrollText className="mr-3 h-5 w-5" />
                                General ledger
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('accounting.trial-balance.index')}>
                                <Scale className="mr-3 h-5 w-5" />
                                Trial balance
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('financial-analysis.dashboard')}>
                                <Gauge className="mr-3 h-5 w-5" />
                                Financial analysis
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto justify-start py-4">
                            <Link href={route('accounting.financial-statements.index')}>
                                <FileSpreadsheet className="mr-3 h-5 w-5" />
                                Financial statements
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
