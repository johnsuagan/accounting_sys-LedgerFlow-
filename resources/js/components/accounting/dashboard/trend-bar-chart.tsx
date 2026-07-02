import { formatLedgerAmount } from '@/lib/general-ledger-format';

interface TrendBarChartProps {
    data: Array<{
        period: string;
        revenue: string;
        expenses: string;
        net_income: string;
    }>;
    metric: 'revenue' | 'expenses' | 'net_income';
    label: string;
}

export function TrendBarChart({ data, metric, label }: TrendBarChartProps) {
    if (data.length === 0) {
        return <p className="text-muted-foreground text-sm">No data yet.</p>;
    }

    const values = data.map((point) => Math.abs(Number(point[metric])));
    const max = Math.max(...values, 1);

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            <div className="space-y-2">
                {data.map((point) => {
                    const value = Math.abs(Number(point[metric]));
                    const width = `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%`;

                    return (
                        <div key={point.period} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{point.period}</span>
                                <span className="font-mono">{formatLedgerAmount(point[metric])}</span>
                            </div>
                            <div className="bg-muted h-2 rounded-full">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
