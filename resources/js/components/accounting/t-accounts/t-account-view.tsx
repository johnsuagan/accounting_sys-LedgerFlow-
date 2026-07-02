import { formatBalanceDisplay, formatLedgerAmount } from '@/lib/general-ledger-format';
import { accountTypeLabels, normalBalanceLabels } from '@/lib/accounting-labels';
import type { GeneralLedgerLine, GeneralLedgerResult } from '@/types/general-ledger';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface TAccountViewProps {
    ledger: GeneralLedgerResult;
}

export function TAccountView({ ledger }: TAccountViewProps) {
    const periodLines = ledger.lines.filter((line) => !line.is_opening_balance);
    const debitEntries = periodLines.filter((line) => Number(line.debit) > 0);
    const creditEntries = periodLines.filter((line) => Number(line.credit) > 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end print:hidden">
                <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
                </Button>
            </div>

            <div className="t-account-print mx-auto max-w-2xl rounded-xl border bg-card" id="t-account-view">
                <div className="border-b px-6 py-4 text-center">
                    <p className="text-lg font-semibold">
                        {ledger.account.account_name} ({ledger.account.account_code})
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {accountTypeLabels[ledger.account.account_type as keyof typeof accountTypeLabels]} · Normal
                        balance: {normalBalanceLabels[ledger.account.normal_balance as keyof typeof normalBalanceLabels]}
                    </p>
                </div>

                <div className="grid grid-cols-2 border-b text-center text-sm font-semibold uppercase tracking-wide">
                    <div className="border-r px-4 py-2">Debit</div>
                    <div className="px-4 py-2">Credit</div>
                </div>

                <div className="grid min-h-[120px] grid-cols-2">
                    <div className="space-y-1 border-r px-4 py-3 font-mono text-sm">
                        {debitEntries.length === 0 ? (
                            <p className="text-muted-foreground">&nbsp;</p>
                        ) : (
                            debitEntries.map((line, index) => (
                                <TAccountAmount key={`debit-${line.journal_entry_line_id ?? index}`} line={line} side="debit" />
                            ))
                        )}
                    </div>
                    <div className="space-y-1 px-4 py-3 font-mono text-sm">
                        {creditEntries.length === 0 ? (
                            <p className="text-muted-foreground">&nbsp;</p>
                        ) : (
                            creditEntries.map((line, index) => (
                                <TAccountAmount key={`credit-${line.journal_entry_line_id ?? index}`} line={line} side="credit" />
                            ))
                        )}
                    </div>
                </div>

                <div className="border-t px-6 py-4 text-center">
                    <p className="text-muted-foreground mb-1 text-xs uppercase">Balance</p>
                    <p className="font-mono text-base font-semibold">
                        {formatBalanceDisplay(ledger.closing_balance_amount, ledger.closing_balance_side)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Normal balance: {ledger.account.normal_balance.toUpperCase()}
                    </p>
                    {Number(ledger.opening_balance_amount) > 0 && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            Opening: {formatBalanceDisplay(ledger.opening_balance_amount, ledger.opening_balance_side)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function TAccountAmount({ line, side }: { line: GeneralLedgerLine; side: 'debit' | 'credit' }) {
    const amount = side === 'debit' ? line.debit : line.credit;

    return (
        <div className="flex flex-col">
            <span>{formatLedgerAmount(amount)}</span>
            {line.date && (
                <span className="text-muted-foreground text-xs">
                    {line.entry_number} · {line.date}
                </span>
            )}
        </div>
    );
}
