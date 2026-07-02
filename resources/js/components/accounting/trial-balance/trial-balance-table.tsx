import { formatLedgerAmount } from '@/lib/general-ledger-format';
import { financialStatementLabel } from '@/lib/financial-statement-labels';
import type { TrialBalanceLine } from '@/types/trial-balance';
import { Link } from '@inertiajs/react';

interface TrialBalanceTableProps {
    lines: TrialBalanceLine[];
}

export function TrialBalanceTable({ lines }: TrialBalanceTableProps) {
    return (
        <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Code</th>
                            <th className="px-4 py-3 text-left font-medium">Account Name</th>
                            <th className="px-4 py-3 text-left font-medium">Statement</th>
                            <th className="px-4 py-3 text-right font-medium">Debit Balance</th>
                            <th className="px-4 py-3 text-right font-medium">Credit Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                    No account balances as of this date.
                                </td>
                            </tr>
                        ) : (
                            lines.map((line) => (
                                <tr key={line.account_id} className="border-b hover:bg-muted/40">
                                    <td className="px-4 py-3 font-mono">{line.account_code}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={route('accounting.general-ledger.index', {
                                                account_id: line.account_id,
                                                date_from: '2000-01-01',
                                                date_to: new Date().toISOString().slice(0, 10),
                                            })}
                                            className="text-primary hover:underline"
                                        >
                                            {line.account_name}
                                        </Link>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3 text-sm">
                                        {financialStatementLabel(line.account_type)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {Number(line.debit_balance) > 0 ? formatLedgerAmount(line.debit_balance) : ''}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {Number(line.credit_balance) > 0 ? formatLedgerAmount(line.credit_balance) : ''}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3 md:hidden">
                {lines.map((line) => (
                    <div key={line.account_id} className="rounded-xl border p-4">
                        <p className="font-mono text-sm font-medium">
                            {line.account_code} — {line.account_name}
                        </p>
                        <p className="text-muted-foreground mb-2 text-xs">{financialStatementLabel(line.account_type)}</p>
                        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Debit</p>
                                <p>{Number(line.debit_balance) > 0 ? formatLedgerAmount(line.debit_balance) : '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Credit</p>
                                <p>{Number(line.credit_balance) > 0 ? formatLedgerAmount(line.credit_balance) : '—'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

interface TrialBalanceSummaryProps {
    totalDebit: string;
    totalCredit: string;
    isBalanced: boolean;
    difference: string;
}

export function TrialBalanceSummary({ totalDebit, totalCredit, isBalanced, difference }: TrialBalanceSummaryProps) {
    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3">
            <div>
                <p className="text-muted-foreground text-xs uppercase">Total debits</p>
                <p className="font-mono text-lg font-semibold">{formatLedgerAmount(totalDebit)}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs uppercase">Total credits</p>
                <p className="font-mono text-lg font-semibold">{formatLedgerAmount(totalCredit)}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs uppercase">Status</p>
                <p className={`text-lg font-semibold ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isBalanced ? '✓ Balanced' : `✗ Out of balance (${formatLedgerAmount(difference)})`}
                </p>
            </div>
        </div>
    );
}
