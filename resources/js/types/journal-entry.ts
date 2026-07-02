export type JournalEntryStatus = 'draft' | 'posted' | 'reversed' | 'cancelled';

export type JournalEntrySource = 'manual' | 'reversal' | 'system' | 'opening_balance';

export interface PostableAccount {
    id: number;
    account_code: string;
    account_name: string;
    account_type?: string;
    normal_balance?: string;
}

export interface JournalEntryLine {
    id?: number;
    line_number: number;
    account_id: number | null;
    account_code?: string | null;
    account_name?: string | null;
    account_type?: string | null;
    description?: string | null;
    debit: number | string;
    credit: number | string;
}

export interface JournalEntryAttachment {
    id: number;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    uploaded_by: number | null;
    uploaded_by_name?: string | null;
    created_at?: string | null;
}

export interface JournalEntrySummary {
    id: number;
    entry_number: string | null;
    entry_date: string;
    description: string;
    status: JournalEntryStatus;
    source: JournalEntrySource;
    total_debit: number | string;
    total_credit: number | string;
    lines_count: number;
    is_balanced: boolean;
}

export interface JournalEntryDetail extends JournalEntrySummary {
    company_id: number;
    fiscal_year_id: number;
    accounting_period_id: number;
    reference: string | null;
    memo: string | null;
    reversal_of_id: number | null;
    reversed_by_id: number | null;
    reversal_reason: string | null;
    posted_at: string | null;
    cancelled_at: string | null;
    fiscal_year: { id: number; name: string } | null;
    accounting_period: { id: number; name: string } | null;
    posted_by: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    reversal_of: { id: number; entry_number: string | null } | null;
    reversed_by: { id: number; entry_number: string | null } | null;
    lines: JournalEntryLine[];
    attachments: JournalEntryAttachment[];
}

export interface JournalEntryPermissions {
    write: boolean;
    update: boolean;
    delete: boolean;
    post: boolean;
    cancel: boolean;
    reverse: boolean;
    uploadAttachment: boolean;
}

export interface JournalEntryEnums {
    statuses: JournalEntryStatus[];
    sources: JournalEntrySource[];
}

export interface JournalEntryIndexFilters {
    search: string;
    status: string;
    date_from: string;
    date_to: string;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}
