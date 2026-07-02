import { AnalysisExportBar } from '@/components/financial-analysis/analysis-export-bar';
import { RevenueVsExpensesChart, TrendBarChart } from '@/components/financial-analysis/analysis-charts';
import { AnalysisFiltersBar } from '@/components/financial-analysis/analysis-filters';
import { FinancialAnalysisNav } from '@/components/financial-analysis/financial-analysis-nav';
import { KpiComparisonCard } from '@/components/financial-analysis/kpi-comparison-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FinancialAnalysisPageProps, TrendsData } from '@/types/financial-analysis';
import { Head } from '@inertiajs/react';

interface TrendsPageProps extends FinancialAnalysisPageProps {
    data: TrendsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Analysis', href: route('financial-analysis.dashboard') },
    { title: 'Trend Analysis', href: route('financial-analysis.trends') },
];

export default function TrendAnalysis({ data, filters, fiscalYears }: TrendsPageProps) {
    const csvData = [
        ['Period', 'Revenue', 'Expenses', 'Net Income'],
        ...data.current.map((point) => [point.period, point.revenue, point.expenses, point.net_income]),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trend Analysis" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Trend Analysis</h1>
                        <p className="text-muted-foreground text-sm">
                            Current period vs previous {filters.comparison_type}
                        </p>
                    </div>
                    <AnalysisExportBar filename="trend-analysis" csvData={csvData} />
                </div>

                <FinancialAnalysisNav current="financial-analysis.trends" />
                <AnalysisFiltersBar filters={filters} fiscalYears={fiscalYears} routeName="financial-analysis.trends" />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.comparison.map((kpi) => (
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
                            <CardTitle className="text-base">Current Period — Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.current} metric="revenue" label="Monthly revenue" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Previous Period — Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.previous} metric="revenue" label="Monthly revenue" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Current Period — Net Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TrendBarChart data={data.current} metric="net_income" label="Monthly net income" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue vs Expenses (Current)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RevenueVsExpensesChart data={data.current} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
