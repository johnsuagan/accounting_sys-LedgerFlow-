import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatLedgerAmount } from '@/lib/general-ledger-format';
import type { KpiCard } from '@/types/financial-analysis';
import { Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface KpiComparisonCardProps {
    kpi: KpiCard;
    asOfDate: string;
    fiscalYearId?: number | null;
}

export function KpiComparisonCard({ kpi, asOfDate, fiscalYearId }: KpiComparisonCardProps) {
    const statement = kpi.drill_down.statement;
    const query: Record<string, string> = { statement };

    if (statement === 'income_statement') {
        query.date_from = `${asOfDate.slice(0, 4)}-01-01`;
        query.date_to = asOfDate;
    } else {
        query.as_of_date = asOfDate;
    }

    if (fiscalYearId) query.fiscal_year_id = String(fiscalYearId);

    const DirectionIcon =
        kpi.direction === 'up' ? ArrowUpRight : kpi.direction === 'down' ? ArrowDownRight : Minus;

    const changeColor =
        kpi.direction === 'up' ? 'text-emerald-600' : kpi.direction === 'down' ? 'text-red-600' : 'text-muted-foreground';

    return (
        <Link href={route(kpi.drill_down.route, query)} className="block transition-opacity hover:opacity-90">
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="font-mono text-2xl font-bold">{formatLedgerAmount(kpi.current_value)}</p>
                    {kpi.previous_value !== null && (
                        <p className="text-muted-foreground text-xs">
                            Previous: {formatLedgerAmount(kpi.previous_value)}
                        </p>
                    )}
                    {kpi.change_percent !== null && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                            <DirectionIcon className="h-4 w-4" />
                            <span>{kpi.change_percent}%</span>
                        </div>
                    )}
                    <p className="text-primary text-xs">View in financial statements →</p>
                </CardContent>
            </Card>
        </Link>
    );
}
