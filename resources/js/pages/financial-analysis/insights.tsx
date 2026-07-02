import { AnalysisExportBar } from '@/components/financial-analysis/analysis-export-bar';
import { AnalysisFiltersBar } from '@/components/financial-analysis/analysis-filters';
import { FinancialAnalysisNav } from '@/components/financial-analysis/financial-analysis-nav';
import { HealthScorePanel } from '@/components/financial-analysis/health-score-panel';
import { InsightList } from '@/components/financial-analysis/insight-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FinancialAnalysisPageProps, InsightsData } from '@/types/financial-analysis';
import { Head } from '@inertiajs/react';

interface InsightsPageProps extends FinancialAnalysisPageProps {
    data: InsightsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Analysis', href: route('financial-analysis.dashboard') },
    { title: 'Financial Insights', href: route('financial-analysis.insights') },
];

export default function FinancialInsights({ data, filters, fiscalYears }: InsightsPageProps) {
    const csvData = [['Insight'], ...data.insights.map((insight) => [insight.message])];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Insights" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Financial Insights</h1>
                        <p className="text-muted-foreground text-sm">
                            Rule-based analysis for {filters.period_label ?? filters.as_of_date}
                        </p>
                    </div>
                    <AnalysisExportBar filename="financial-insights" csvData={csvData} />
                </div>

                <FinancialAnalysisNav current="financial-analysis.insights" />
                <AnalysisFiltersBar filters={filters} fiscalYears={fiscalYears} routeName="financial-analysis.insights" />

                <HealthScorePanel health={data.health} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Business Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InsightList insights={data.insights} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
