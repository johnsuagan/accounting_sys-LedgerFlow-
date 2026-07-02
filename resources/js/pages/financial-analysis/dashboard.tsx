import { AnalysisExportBar } from '@/components/financial-analysis/analysis-export-bar';
import {
    CompositionBreakdown,
    RevenueVsExpensesChart,
    TrendBarChart,
} from '@/components/financial-analysis/analysis-charts';
import { AnalysisFiltersBar } from '@/components/financial-analysis/analysis-filters';
import { FinancialAnalysisNav } from '@/components/financial-analysis/financial-analysis-nav';
import { HealthScorePanel } from '@/components/financial-analysis/health-score-panel';
import { InsightList } from '@/components/financial-analysis/insight-list';
import { KpiComparisonCard } from '@/components/financial-analysis/kpi-comparison-card';
import { TopAccountsList } from '@/components/financial-analysis/top-accounts-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DashboardData, FinancialAnalysisPageProps } from '@/types/financial-analysis';
import { Head } from '@inertiajs/react';

interface DashboardPageProps extends FinancialAnalysisPageProps {
    data: DashboardData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Analysis', href: route('financial-analysis.dashboard') },
];

export default function FinancialAnalysisDashboard({ data, filters, fiscalYears }: DashboardPageProps) {
    const csvData = [
        ['KPI', 'Current', 'Previous', 'Change %'],
        ...data.kpis.map((kpi) => [
            kpi.label,
            kpi.current_value,
            kpi.previous_value ?? '',
            kpi.change_percent ?? '',
        ]),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Analysis Dashboard" />

            <div className="flex flex-col gap-6 p-4" id="financial-analysis-dashboard">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Financial Analysis Dashboard</h1>
                        <p className="text-muted-foreground text-sm">
                            Period: {filters.period_label ?? filters.as_of_date} · Compared with previous{' '}
                            {filters.comparison_type}
                        </p>
                    </div>
                    <AnalysisExportBar filename="financial-analysis-dashboard" csvData={csvData} />
                </div>

                <FinancialAnalysisNav current="financial-analysis.dashboard" />
                <AnalysisFiltersBar filters={filters} fiscalYears={fiscalYears} routeName="financial-analysis.dashboard" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.kpis.map((kpi) => (
                        <KpiComparisonCard
                            key={kpi.key}
                            kpi={kpi}
                            asOfDate={filters.as_of_date}
                            fiscalYearId={filters.fiscal_year_id}
                        />
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.trends} metric="revenue" label="Monthly revenue" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Expense Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.trends} metric="expenses" label="Monthly expenses" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Net Income Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.trends} metric="net_income" label="Monthly net income" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RevenueVsExpensesChart data={data.trends} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <CompositionBreakdown title="Assets Breakdown" accounts={data.composition.assets} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <CompositionBreakdown title="Liabilities Breakdown" accounts={data.composition.liabilities} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <CompositionBreakdown title="Expenses Breakdown" accounts={data.composition.expenses} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <TopAccountsList
                                title="Top Revenue Accounts"
                                accounts={data.top_accounts.revenue}
                                asOfDate={filters.as_of_date}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <TopAccountsList
                                title="Top Expense Accounts"
                                accounts={data.top_accounts.expense}
                                asOfDate={filters.as_of_date}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <TopAccountsList
                                title="Highest Asset Accounts"
                                accounts={data.top_accounts.asset}
                                asOfDate={filters.as_of_date}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <TopAccountsList
                                title="Largest Liability Accounts"
                                accounts={data.top_accounts.liability}
                                asOfDate={filters.as_of_date}
                            />
                        </CardContent>
                    </Card>
                </div>

                <HealthScorePanel health={data.health} />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InsightList insights={data.insights} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
