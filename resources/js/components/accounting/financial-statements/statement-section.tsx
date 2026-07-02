import { formatLedgerAmount } from '@/lib/general-ledger-format';
import type { FinancialStatementLine } from '@/types/financial-statements';
import { Link } from '@inertiajs/react';

interface StatementSectionProps {
    title: string;
    lines: FinancialStatementLine[];
    total: string;
    totalLabel: string;
}

export function StatementSection({ title, lines, total, totalLabel }: StatementSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="border-b pb-2 text-sm font-semibold uppercase tracking-wide">{title}</h3>
            {lines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No balances in this section.</p>
            ) : (
                <ul className="space-y-1">
                    {lines.map((line) => (
                        <li key={line.account_id} className="flex justify-between gap-4 text-sm">
                            <Link
                                href={route('accounting.general-ledger.index', {
                                    account_id: line.account_id,
                                    date_from: '2000-01-01',
                                    date_to: new Date().toISOString().slice(0, 10),
                                })}
                                className="text-primary hover:underline"
                            >
                                <span className="font-mono">{line.account_code}</span> {line.account_name}
                            </Link>
                            <span className="font-mono">{formatLedgerAmount(line.amount)}</span>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
                <span>{totalLabel}</span>
                <span className="font-mono">{formatLedgerAmount(total)}</span>
            </div>
        </div>
    );
}
