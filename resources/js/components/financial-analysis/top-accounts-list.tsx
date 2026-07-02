import { AccountTraceLinks } from '@/components/accounting/account-trace-links';
import { formatLedgerAmount } from '@/lib/general-ledger-format';
import type { CompositionAccount } from '@/types/financial-analysis';

interface TopAccountsListProps {
    title: string;
    accounts: CompositionAccount[];
    asOfDate: string;
}

export function TopAccountsList({ title, accounts, asOfDate }: TopAccountsListProps) {
    if (accounts.length === 0) {
        return (
            <div>
                <p className="mb-2 text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-sm">No accounts with balances.</p>
            </div>
        );
    }

    const yearStart = `${asOfDate.slice(0, 4)}-01-01`;

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">{title}</p>
            <ul className="space-y-3">
                {accounts.map((account) => (
                    <li key={account.account_id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium">
                                    {account.account_code} — {account.account_name}
                                </p>
                                <AccountTraceLinks
                                    accountId={account.account_id}
                                    accountType={account.account_type}
                                    dateFrom={yearStart}
                                    dateTo={asOfDate}
                                    className="mt-2"
                                />
                            </div>
                            <p className="font-mono text-sm font-semibold">{formatLedgerAmount(account.amount)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
