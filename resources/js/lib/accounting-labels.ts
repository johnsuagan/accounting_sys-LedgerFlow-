import type { AccountSubtype, AccountType, NormalBalance } from '@/types/accounting';

export const accountTypeLabels: Record<AccountType, string> = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense',
};

export const accountSubtypeLabels: Record<AccountSubtype, string> = {
    current_asset: 'Current Asset',
    non_current_asset: 'Non-Current Asset',
    current_liability: 'Current Liability',
    non_current_liability: 'Non-Current Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense',
};

export const normalBalanceLabels: Record<NormalBalance, string> = {
    debit: 'Debit',
    credit: 'Credit',
};

export function normalBalanceForType(type: AccountType): NormalBalance {
    return type === 'asset' || type === 'expense' ? 'debit' : 'credit';
}
