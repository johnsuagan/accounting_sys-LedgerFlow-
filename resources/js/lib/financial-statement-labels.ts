import type { AccountType } from '@/types/accounting';

export function financialStatementForAccountType(type: AccountType | string): 'income_statement' | 'statement_of_financial_position' {
    return type === 'revenue' || type === 'expense' ? 'income_statement' : 'statement_of_financial_position';
}

export function financialStatementLabel(type: AccountType | string): string {
    return financialStatementForAccountType(type) === 'income_statement'
        ? 'Income Statement'
        : 'Statement of Financial Position';
}
