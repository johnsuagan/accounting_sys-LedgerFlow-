export interface TrialBalanceFilters {
    as_of_date: string;
    fiscal_year_id: number | null;
}

export interface TrialBalanceLine {
    account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    normal_balance: string;
    debit_balance: string;
    credit_balance: string;
    financial_statement: string;
}

export interface TrialBalanceResult {
    lines: TrialBalanceLine[];
    total_debit: string;
    total_credit: string;
    is_balanced: boolean;
    difference: string;
    filters: TrialBalanceFilters;
}
