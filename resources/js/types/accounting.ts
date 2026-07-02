export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountSubtype =
    | 'current_asset'
    | 'non_current_asset'
    | 'current_liability'
    | 'non_current_liability'
    | 'equity'
    | 'revenue'
    | 'expense';

export type NormalBalance = 'debit' | 'credit';

export interface Account {
    id: number;
    account_code: string;
    account_name: string;
    account_type: AccountType;
    account_subtype: AccountSubtype;
    normal_balance: NormalBalance;
    parent_id: number | null;
    level: number;
    path: string | null;
    is_header: boolean;
    is_system: boolean;
    is_active: boolean;
    is_postable: boolean;
    has_posted_activity?: boolean;
    description: string | null;
}

export interface AccountTreeNode extends Account {
    children: AccountTreeNode[];
}

export interface ParentOption {
    id: number;
    account_code: string;
    account_name: string;
    level: number;
}

export interface AccountFilters {
    search: string;
    account_type: string;
    is_active: boolean | null;
}

export interface AccountEnums {
    accountTypes: AccountType[];
    accountSubtypes: AccountSubtype[];
}
