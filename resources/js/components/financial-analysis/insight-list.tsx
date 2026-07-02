import type { FinancialInsight } from '@/types/financial-analysis';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const iconMap = {
    positive: CheckCircle2,
    warning: AlertCircle,
    info: Info,
};

const colorMap = {
    positive: 'text-emerald-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
};

interface InsightListProps {
    insights: FinancialInsight[];
}

export function InsightList({ insights }: InsightListProps) {
    if (insights.length === 0) {
        return <p className="text-muted-foreground text-sm">No insights available for this period.</p>;
    }

    return (
        <ul className="space-y-3">
            {insights.map((insight, index) => {
                const Icon = iconMap[insight.type];
                const color = colorMap[insight.type];

                return (
                    <li key={index} className="flex gap-3 rounded-lg border bg-card p-4">
                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                        <p className="text-sm">{insight.message}</p>
                    </li>
                );
            })}
        </ul>
    );
}
