import { StatementSection } from '@/components/accounting/financial-statements/statement-section';
import type { GroupedStatementSection } from '@/types/financial-statements';
import { formatLedgerAmount } from '@/lib/general-ledger-format';

interface GroupedStatementSectionsProps {
    sections: GroupedStatementSection[];
}

export function GroupedStatementSections({ sections }: GroupedStatementSectionsProps) {
    return (
        <div className="space-y-6">
            {sections.map((section) => (
                <StatementSection
                    key={section.label}
                    title={section.label}
                    lines={section.lines}
                    total={section.total}
                    totalLabel={`Total ${section.label}`}
                />
            ))}
        </div>
    );
}

interface ChangesInEquityViewProps {
    beginningCapital: string;
    netIncome: string;
    withdrawals: string;
    endingCapital: string;
    isNetLoss: boolean;
}

export function ChangesInEquityView({
    beginningCapital,
    netIncome,
    withdrawals,
    endingCapital,
    isNetLoss,
}: ChangesInEquityViewProps) {
    return (
        <div className="mx-auto w-full max-w-xl space-y-3 rounded-xl border bg-card p-6 font-mono text-sm">
            <div className="flex justify-between border-b pb-2">
                <span>Beginning Capital</span>
                <span>{formatLedgerAmount(beginningCapital)}</span>
            </div>
            <div className="flex justify-between">
                <span>{isNetLoss ? 'Less: Net Loss' : 'Add: Net Income'}</span>
                <span>{formatLedgerAmount(netIncome)}</span>
            </div>
            <div className="flex justify-between">
                <span>Less: Withdrawals</span>
                <span>{formatLedgerAmount(withdrawals)}</span>
            </div>
            <div className="flex justify-between border-t-2 pt-3 text-base font-bold">
                <span>Ending Capital</span>
                <span>{formatLedgerAmount(endingCapital)}</span>
            </div>
        </div>
    );
}
