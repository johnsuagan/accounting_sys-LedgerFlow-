export interface LedgerAccountOption {
    id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    is_header: boolean;
}

export interface FiscalYearOption {
    id: number;
    name: string;
    year: number;
    start_date: string;
    end_date: string;
}

export interface GeneralLedgerFilters {
    account_id: number | null;
    date_from: string;
    date_to: string;
    fiscal_year_id: number | null;
    include_descendants: boolean;
    view?: 'ledger' | 't-account';
}

export interface GeneralLedgerAccountSummary {
    id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    normal_balance: string;
    is_header: boolean;
    rollup_enabled: boolean;
}

export interface GeneralLedgerLine {
    date: string | null;
    entry_number: string | null;
    reference: string | null;
    description: string;
    debit: string;
    credit: string;
    running_balance: string;
    balance_amount: string;
    balance_side: 'DR' | 'CR';
    journal_entry_id: number | null;
    journal_entry_line_id: number | null;
    is_opening_balance: boolean;
}

export interface GeneralLedgerResult {
    account: GeneralLedgerAccountSummary;
    lines: GeneralLedgerLine[];
    opening_balance: string;
    opening_balance_amount: string;
    opening_balance_side: 'DR' | 'CR';
    closing_balance: string;
    closing_balance_amount: string;
    closing_balance_side: 'DR' | 'CR';
    total_debit: string;
    total_credit: string;
    filters: GeneralLedgerFilters;
    includes_descendants: boolean;
}
