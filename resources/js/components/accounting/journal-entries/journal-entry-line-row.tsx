import { AccountPicker } from '@/components/accounting/journal-entries/account-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { accountTypeLabels, normalBalanceLabels } from '@/lib/accounting-labels';
import type { PostableAccount } from '@/types/journal-entry';
import { Trash2 } from 'lucide-react';

export interface JournalLineField {
    account_id: number | null;
    line_number: number;
    description?: string | null;
    debit: number | string;
    credit: number | string;
}

interface JournalEntryLineRowProps {
    line: JournalLineField;
    index: number;
    accounts: PostableAccount[];
    readOnly?: boolean;
    canRemove: boolean;
    onChange: (index: number, field: Partial<JournalLineField>) => void;
    onRemove: (index: number) => void;
}

export function JournalEntryLineRow({
    line,
    index,
    accounts,
    readOnly = false,
    canRemove,
    onChange,
    onRemove,
}: JournalEntryLineRowProps) {
    const selectedAccount = accounts.find((account) => account.id === line.account_id) ?? null;

    const handleDebitChange = (value: string) => {
        onChange(index, { debit: value, credit: value ? 0 : line.credit });
    };

    const handleCreditChange = (value: string) => {
        onChange(index, { credit: value, debit: value ? 0 : line.debit });
    };

    return (
        <>
            <div className="hidden gap-3 md:grid md:grid-cols-[minmax(220px,2fr)_minmax(180px,2fr)_120px_120px_48px] md:items-center">
                <AccountPicker
                    accounts={accounts}
                    value={line.account_id}
                    onChange={(accountId) => onChange(index, { account_id: accountId })}
                    disabled={readOnly}
                />
                <Input
                    value={line.description ?? ''}
                    onChange={(event) => onChange(index, { description: event.target.value })}
                    placeholder="Line description"
                    disabled={readOnly}
                />
                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.debit}
                    onChange={(event) => handleDebitChange(event.target.value)}
                    disabled={readOnly}
                    className="font-mono"
                />
                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.credit}
                    onChange={(event) => handleCreditChange(event.target.value)}
                    disabled={readOnly}
                    className="font-mono"
                />
                <div className="flex justify-end">
                    {!readOnly && canRemove && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            {selectedAccount?.account_type && selectedAccount?.normal_balance && (
                <div className="text-muted-foreground hidden rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs md:col-span-full md:grid md:grid-cols-[minmax(220px,2fr)_minmax(180px,2fr)_120px_120px_48px]">
                    <p>
                        Account type:{' '}
                        <span className="text-foreground font-medium">
                            {accountTypeLabels[selectedAccount.account_type as keyof typeof accountTypeLabels]}
                        </span>
                    </p>
                    <p>
                        Normal balance:{' '}
                        <span className="text-foreground font-medium">
                            {normalBalanceLabels[selectedAccount.normal_balance as keyof typeof normalBalanceLabels]}
                        </span>
                    </p>
                </div>
            )}

            <div className="space-y-3 rounded-lg border p-3 md:hidden">
                <AccountPicker
                    accounts={accounts}
                    value={line.account_id}
                    onChange={(accountId) => onChange(index, { account_id: accountId })}
                    disabled={readOnly}
                />
                <Input
                    value={line.description ?? ''}
                    onChange={(event) => onChange(index, { description: event.target.value })}
                    placeholder="Line description"
                    disabled={readOnly}
                />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-muted-foreground mb-1 text-xs">Debit</p>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.debit}
                            onChange={(event) => handleDebitChange(event.target.value)}
                            disabled={readOnly}
                            className="font-mono"
                        />
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1 text-xs">Credit</p>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.credit}
                            onChange={(event) => handleCreditChange(event.target.value)}
                            disabled={readOnly}
                            className="font-mono"
                        />
                    </div>
                </div>
                {!readOnly && canRemove && (
                    <Button type="button" variant="outline" size="sm" onClick={() => onRemove(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove line
                    </Button>
                )}
                {selectedAccount?.account_type && selectedAccount?.normal_balance && (
                    <div className="text-muted-foreground rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs">
                        <p>
                            Account type:{' '}
                            <span className="text-foreground font-medium">
                                {accountTypeLabels[selectedAccount.account_type as keyof typeof accountTypeLabels]}
                            </span>
                        </p>
                        <p>
                            Normal balance:{' '}
                            <span className="text-foreground font-medium">
                                {normalBalanceLabels[selectedAccount.normal_balance as keyof typeof normalBalanceLabels]}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
