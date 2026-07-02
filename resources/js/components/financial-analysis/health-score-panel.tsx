import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthScore } from '@/types/financial-analysis';

const colorMap: Record<string, string> = {
    green: 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20',
    yellow: 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20',
    orange: 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20',
    red: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20',
    gray: 'border-muted bg-muted/30',
};

const labelColor: Record<string, string> = {
    green: 'text-emerald-700 dark:text-emerald-400',
    yellow: 'text-amber-700 dark:text-amber-400',
    orange: 'text-orange-700 dark:text-orange-400',
    red: 'text-red-700 dark:text-red-400',
    gray: 'text-muted-foreground',
};

interface HealthScorePanelProps {
    health: HealthScore;
    title?: string;
}

export function HealthScorePanel({ health, title = 'Business Health Summary' }: HealthScorePanelProps) {
    const categories = [
        { key: 'profitability', label: 'Profitability' },
        { key: 'liquidity', label: 'Liquidity' },
        { key: 'solvency', label: 'Solvency' },
        { key: 'efficiency', label: 'Efficiency' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <div
                    className={`mt-2 inline-flex rounded-lg border px-4 py-2 ${colorMap[health.overall.color] ?? colorMap.gray}`}
                >
                    <span className="text-muted-foreground mr-2 text-sm">Overall:</span>
                    <span className={`font-semibold ${labelColor[health.overall.color] ?? labelColor.gray}`}>
                        {health.overall.label}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map(({ key, label }) => {
                        const category = health.categories[key];

                        return (
                            <div
                                key={key}
                                className={`rounded-lg border p-4 ${colorMap[category.color] ?? colorMap.gray}`}
                            >
                                <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
                                <p className={`mt-1 font-semibold ${labelColor[category.color] ?? labelColor.gray}`}>
                                    {category.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
