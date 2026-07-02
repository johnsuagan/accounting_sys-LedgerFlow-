import { AccountTraceLinks } from '@/components/accounting/account-trace-links';
import { formatBalanceDisplay } from '@/lib/general-ledger-format';
import type { TAccountAccountSummary } from '@/types/financial-statements';
import { Link } from '@inertiajs/react';

interface TAccountListProps {
    summaries: TAccountAccountSummary[];
    dateFrom: string;
    dateTo: string;
}

export function TAccountList({ summaries, dateFrom, dateTo }: TAccountListProps) {
    if (summaries.length === 0) {
        return (
            <p className="text-muted-foreground rounded-xl border border-dashed px-6 py-8 text-center text-sm">
                No account balances in this period.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Code</th>
                        <th className="px-4 py-3 text-left font-medium">Account</th>
                        <th className="px-4 py-3 text-right font-medium">Balance</th>
                        <th className="px-4 py-3 text-left font-medium">Trace</th>
                    </tr>
                </thead>
                <tbody>
                    {summaries.map((account) => (
                        <tr key={account.account_id} className="border-b hover:bg-muted/40">
                            <td className="px-4 py-3 font-mono">{account.account_code}</td>
                            <td className="px-4 py-3">
                                <Link
                                    href={route('accounting.t-accounts.index', {
                                        account_id: account.account_id,
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                    })}
                                    className="text-primary font-medium hover:underline"
                                >
                                    {account.account_name}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                                {formatBalanceDisplay(account.balance_amount, account.balance_side)}
                            </td>
                            <td className="px-4 py-3">
                                <AccountTraceLinks
                                    accountId={account.account_id}
                                    accountType={account.account_type}
                                    dateFrom={dateFrom}
                                    dateTo={dateTo}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
