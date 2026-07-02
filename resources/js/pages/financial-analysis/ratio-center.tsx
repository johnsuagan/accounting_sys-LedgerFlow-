import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FinancialAnalysisPageProps, FinancialRatio } from '@/types/financial-analysis';
import { AnalysisExportBar } from '@/components/financial-analysis/analysis-export-bar';
import { AnalysisFiltersBar } from '@/components/financial-analysis/analysis-filters';
import { FinancialAnalysisNav } from '@/components/financial-analysis/financial-analysis-nav';
import { RatioCard } from '@/components/financial-analysis/ratio-card';
import { Head } from '@inertiajs/react';

interface RatioCenterPageProps extends FinancialAnalysisPageProps {
    ratios: FinancialRatio[];
    title: string;
    routeName: string;
    navRoute:
        | 'financial-analysis.profitability'
        | 'financial-analysis.liquidity'
        | 'financial-analysis.solvency'
        | 'financial-analysis.efficiency';
}

const baseBreadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Analysis', href: route('financial-analysis.dashboard') },
];

export function RatioCenterPage({ ratios, filters, fiscalYears, title, routeName, navRoute }: RatioCenterPageProps) {
    const csvData = [
        ['Ratio', 'Formula', 'Result', 'Status'],
        ...ratios.map((ratio) => [ratio.name, ratio.formula, ratio.display_value, ratio.status]),
    ];

    return (
        <AppLayout breadcrumbs={[...baseBreadcrumbs, { title, href: route(routeName) }]}>
            <Head title={title} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-muted-foreground text-sm">
                            As of {filters.as_of_date} · {filters.period_label}
                        </p>
                    </div>
                    <AnalysisExportBar filename={routeName.replace(/\./g, '-')} csvData={csvData} />
                </div>

                <FinancialAnalysisNav current={navRoute} />
                <AnalysisFiltersBar filters={filters} fiscalYears={fiscalYears} routeName={routeName} />

                <div className="grid gap-4 lg:grid-cols-2">
                    {ratios.map((ratio) => (
                        <RatioCard key={ratio.key} ratio={ratio} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
