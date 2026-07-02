export interface FinancialStatementFilters {
    date_from: string;
    date_to: string;
    as_of_date: string;
    fiscal_year_id: number | null;
    statement: 'balance_sheet' | 'income_statement' | 'changes_in_equity';
}

export interface FinancialStatementLine {
    account_id: number;
    account_code: string;
    account_name: string;
    amount: string;
    account_type?: string;
    account_subtype?: string;
}

export interface GroupedStatementSection {
    label: string;
    lines: FinancialStatementLine[];
    total: string;
}

export interface IncomeStatementResult {
    revenue_lines: FinancialStatementLine[];
    expense_lines: FinancialStatementLine[];
    total_revenue: string;
    total_expenses: string;
    net_income: string;
    is_net_loss: boolean;
    filters: FinancialStatementFilters;
}

export interface BalanceSheetResult {
    asset_sections: GroupedStatementSection[];
    liability_sections: GroupedStatementSection[];
    equity_sections: GroupedStatementSection[];
    total_assets: string;
    total_liabilities: string;
    total_equity: string;
    net_income: string;
    total_liabilities_and_equity: string;
    is_balanced: boolean;
    filters: FinancialStatementFilters;
}

export interface ChangesInEquityResult {
    capital_lines: FinancialStatementLine[];
    beginning_capital: string;
    net_income: string;
    withdrawals: string;
    ending_capital: string;
    is_net_loss: boolean;
    filters: FinancialStatementFilters;
}

export interface TAccountAccountSummary {
    account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    account_subtype: string;
    normal_balance: string;
    balance_amount: string;
    balance_side: string;
}
