import { financialStatementLabel } from '@/lib/financial-statement-labels';
import { Link } from '@inertiajs/react';

interface AccountTraceLinksProps {
    accountId: number;
    accountType: string;
    dateFrom?: string;
    dateTo?: string;
    className?: string;
}

export function AccountTraceLinks({ accountId, accountType, dateFrom, dateTo, className }: AccountTraceLinksProps) {
    const from = dateFrom || '2000-01-01';
    const to = dateTo || new Date().toISOString().slice(0, 10);
    const query = { account_id: accountId, date_from: from, date_to: to };

    return (
        <div className={`flex flex-wrap gap-2 text-xs ${className ?? ''}`}>
            <Link href={route('accounting.general-ledger.index', query)} className="text-primary hover:underline">
                General Ledger
            </Link>
            <span className="text-muted-foreground">→</span>
            <Link href={route('accounting.t-accounts.index', query)} className="text-primary hover:underline">
                T-Account
            </Link>
            <span className="text-muted-foreground">→</span>
            <Link
                href={route('accounting.financial-statements.index', {
                    statement: accountType === 'revenue' || accountType === 'expense' ? 'income_statement' : 'balance_sheet',
                    ...(accountType === 'revenue' || accountType === 'expense'
                        ? { date_from: from, date_to: to }
                        : { as_of_date: to }),
                })}
                className="text-primary hover:underline"
            >
                {financialStatementLabel(accountType)}
            </Link>
        </div>
    );
}
