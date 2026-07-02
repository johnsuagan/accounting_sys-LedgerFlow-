import { Link } from '@inertiajs/react';

const analysisNav = [
    { title: 'Dashboard', route: 'financial-analysis.dashboard' },
    { title: 'Profitability', route: 'financial-analysis.profitability' },
    { title: 'Liquidity', route: 'financial-analysis.liquidity' },
    { title: 'Solvency', route: 'financial-analysis.solvency' },
    { title: 'Efficiency', route: 'financial-analysis.efficiency' },
    { title: 'Trend Analysis', route: 'financial-analysis.trends' },
    { title: 'Financial Insights', route: 'financial-analysis.insights' },
] as const;

interface FinancialAnalysisNavProps {
    current: (typeof analysisNav)[number]['route'];
}

export function FinancialAnalysisNav({ current }: FinancialAnalysisNavProps) {
    return (
        <nav className="flex flex-wrap gap-2 print:hidden">
            {analysisNav.map((item) => (
                <Link
                    key={item.route}
                    href={route(item.route)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        current === item.route
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
