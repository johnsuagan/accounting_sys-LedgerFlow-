import type { FiscalYearOption } from '@/types/general-ledger';

export type ComparisonType = 'month' | 'quarter' | 'year';

export interface AnalysisFilters {
    as_of_date: string;
    comparison_type: ComparisonType;
    fiscal_year_id: number | null;
    period_label?: string;
}

export interface KpiCard {
    key: string;
    label: string;
    current_value: string;
    previous_value: string | null;
    change_percent: string | null;
    direction: 'up' | 'down' | 'neutral';
    drill_down: {
        route: string;
        statement: string;
    };
}

export interface TrendPoint {
    period: string;
    revenue: string;
    expenses: string;
    net_income: string;
}

export interface CompositionAccount {
    account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    amount: string;
}

export interface HealthCategory {
    label: string;
    color: string;
    score: number;
}

export interface HealthScore {
    categories: {
        profitability: HealthCategory;
        liquidity: HealthCategory;
        solvency: HealthCategory;
        efficiency: HealthCategory;
    };
    overall: {
        label: string;
        color: string;
    };
}

export interface FinancialInsight {
    type: 'positive' | 'warning' | 'info';
    message: string;
}

export interface FinancialRatio {
    key: string;
    name: string;
    formula: string;
    computation: string;
    value: string | null;
    display_value: string;
    interpretation: string;
    status: string;
    status_color: string;
    is_future: boolean;
}

export interface DashboardData {
    filters: AnalysisFilters;
    kpis: KpiCard[];
    trends: TrendPoint[];
    composition: {
        assets: CompositionAccount[];
        liabilities: CompositionAccount[];
        expenses: CompositionAccount[];
    };
    top_accounts: {
        revenue: CompositionAccount[];
        expense: CompositionAccount[];
        asset: CompositionAccount[];
        liability: CompositionAccount[];
    };
    health: HealthScore;
    insights: FinancialInsight[];
}

export interface TrendsData {
    filters: AnalysisFilters;
    current: TrendPoint[];
    previous: TrendPoint[];
    comparison: KpiCard[];
}

export interface InsightsData {
    filters: AnalysisFilters;
    insights: FinancialInsight[];
    health: HealthScore;
}

export interface FinancialAnalysisPageProps {
    fiscalYears: FiscalYearOption[];
    filters: AnalysisFilters;
}
