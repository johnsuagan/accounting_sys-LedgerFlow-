import { formatCurrency, type BalanceState } from '@/lib/journal-entry-math';
import { cn } from '@/lib/utils';

interface BalanceIndicatorProps {
    totalDebit: number;
    totalCredit: number;
    difference: number;
    state: BalanceState;
}

const stateStyles: Record<BalanceState, string> = {
    balanced: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
    unbalanced: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
    invalid: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
};

const stateLabels: Record<BalanceState, string> = {
    balanced: 'Balanced',
    unbalanced: 'Unbalanced draft',
    invalid: 'Invalid for posting',
};

export function BalanceIndicator({ totalDebit, totalCredit, difference, state }: BalanceIndicatorProps) {
    return (
        <div className={cn('rounded-lg border p-4', stateStyles[state])}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Balance</h3>
                <span className="text-xs font-semibold uppercase tracking-wide">{stateLabels[state]}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <p className="text-xs opacity-80">Total Debit</p>
                    <p className="font-mono text-lg font-semibold">{formatCurrency(totalDebit)}</p>
                </div>
                <div>
                    <p className="text-xs opacity-80">Total Credit</p>
                    <p className="font-mono text-lg font-semibold">{formatCurrency(totalCredit)}</p>
                </div>
                <div>
                    <p className="text-xs opacity-80">Difference</p>
                    <p className="font-mono text-lg font-semibold">{formatCurrency(difference)}</p>
                </div>
            </div>
        </div>
    );
}
