import { AccountPicker } from '@/components/accounting/journal-entries/account-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountTypeLabels } from '@/lib/accounting-labels';
import type { AccountType } from '@/types/accounting';
import type { FiscalYearOption, GeneralLedgerFilters, LedgerAccountOption } from '@/types/general-ledger';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface TAccountFilters extends GeneralLedgerFilters {
    account_type?: string;
}

interface TAccountFiltersBarProps {
    accounts: LedgerAccountOption[];
    fiscalYears: FiscalYearOption[];
    filters: TAccountFilters;
    accountTypes: string[];
}

export function TAccountFiltersBar({ accounts, fiscalYears, filters, accountTypes }: TAccountFiltersBarProps) {
    const [accountId, setAccountId] = useState<number | null>(filters.account_id);
    const [accountType, setAccountType] = useState(filters.account_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [fiscalYearId, setFiscalYearId] = useState(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');

    useEffect(() => {
        setAccountId(filters.account_id);
        setAccountType(filters.account_type || 'all');
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
        setFiscalYearId(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');
    }, [filters]);

    const buildQuery = (withAccount: boolean): Record<string, string> | null => {
        if (!dateFrom || !dateTo) {
            return null;
        }

        const query: Record<string, string> = {
            date_from: dateFrom,
            date_to: dateTo,
        };

        if (withAccount && accountId) {
            query.account_id = String(accountId);
        }

        if (accountType !== 'all') {
            query.account_type = accountType;
        }

        if (fiscalYearId !== 'all') {
            query.fiscal_year_id = fiscalYearId;
        }

        return query;
    };

    const browseAccounts = () => {
        const query = buildQuery(false);
        if (!query) return;

        router.get(route('accounting.t-accounts.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const viewTAccount = () => {
        const query = buildQuery(true);
        if (!query || !accountId) return;

        router.get(route('accounting.t-accounts.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clear = () => {
        router.get(route('accounting.t-accounts.index'), {}, { preserveState: true, replace: true });
    };

    const pickerAccounts = accounts.map((account) => ({
        id: account.id,
        account_code: account.account_code,
        account_name: account.account_name,
    }));

    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
                <Label>Account (optional)</Label>
                <AccountPicker accounts={pickerAccounts} value={accountId} onChange={setAccountId} />
            </div>

            <div className="space-y-2">
                <Label>Account type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger>
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {accountTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {accountTypeLabels[type as AccountType]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ta-date-from">Date from</Label>
                <Input id="ta-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="ta-date-to">Date to</Label>
                <Input id="ta-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label>Fiscal year</Label>
                <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                    <SelectTrigger>
                        <SelectValue placeholder="All fiscal years" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All fiscal years</SelectItem>
                        {fiscalYears.map((year) => (
                            <SelectItem key={year.id} value={String(year.id)}>
                                {year.name} ({year.year})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap items-end gap-2 lg:col-span-6">
                <Button type="button" onClick={browseAccounts} disabled={!dateFrom || !dateTo}>
                    <Search className="mr-2 h-4 w-4" />
                    Browse accounts
                </Button>
                <Button type="button" variant="secondary" onClick={viewTAccount} disabled={!accountId || !dateFrom || !dateTo}>
                    View T-Account
                </Button>
                <Button type="button" variant="outline" onClick={clear}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
