import { TrendBarChart } from '@/components/accounting/dashboard/trend-bar-chart';
import { formatLedgerAmount } from '@/lib/general-ledger-format';
import type { CompositionAccount, TrendPoint } from '@/types/financial-analysis';

interface CompositionBreakdownProps {
    title: string;
    accounts: CompositionAccount[];
}

export function CompositionBreakdown({ title, accounts }: CompositionBreakdownProps) {
    if (accounts.length === 0) {
        return (
            <div>
                <p className="mb-2 text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-sm">No balances recorded.</p>
            </div>
        );
    }

    const max = Math.max(...accounts.map((a) => Math.abs(Number(a.amount))), 1);

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{title}</p>
            <div className="space-y-2">
                {accounts.slice(0, 8).map((account) => {
                    const value = Math.abs(Number(account.amount));
                    const width = `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%`;

                    return (
                        <div key={account.account_id} className="space-y-1">
                            <div className="flex justify-between gap-2 text-xs">
                                <span className="text-muted-foreground truncate">
                                    {account.account_code} — {account.account_name}
                                </span>
                                <span className="font-mono shrink-0">{formatLedgerAmount(account.amount)}</span>
                            </div>
                            <div className="bg-muted h-2 rounded-full">
                                <div className="bg-primary/80 h-2 rounded-full" style={{ width }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface RevenueVsExpensesChartProps {
    data: TrendPoint[];
}

export function RevenueVsExpensesChart({ data }: RevenueVsExpensesChartProps) {
    if (data.length === 0) {
        return <p className="text-muted-foreground text-sm">No data yet.</p>;
    }

    const max = Math.max(
        ...data.flatMap((point) => [Math.abs(Number(point.revenue)), Math.abs(Number(point.expenses))]),
        1,
    );

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">Revenue vs Expenses</p>
            {data.map((point) => (
                <div key={point.period} className="space-y-1">
                    <p className="text-muted-foreground text-xs">{point.period}</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-16 text-emerald-700 dark:text-emerald-400">Revenue</span>
                            <div className="bg-muted h-2 flex-1 rounded-full">
                                <div
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{
                                        width: `${Math.max((Math.abs(Number(point.revenue)) / max) * 100, 4)}%`,
                                    }}
                                />
                            </div>
                            <span className="font-mono w-24 text-right">{formatLedgerAmount(point.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-16 text-red-700 dark:text-red-400">Expenses</span>
                            <div className="bg-muted h-2 flex-1 rounded-full">
                                <div
                                    className="h-2 rounded-full bg-red-500"
                                    style={{
                                        width: `${Math.max((Math.abs(Number(point.expenses)) / max) * 100, 4)}%`,
                                    }}
                                />
                            </div>
                            <span className="font-mono w-24 text-right">{formatLedgerAmount(point.expenses)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export { TrendBarChart };
