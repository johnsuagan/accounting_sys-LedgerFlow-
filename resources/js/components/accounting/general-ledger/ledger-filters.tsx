import { AccountPicker } from '@/components/accounting/journal-entries/account-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FiscalYearOption, GeneralLedgerFilters, LedgerAccountOption } from '@/types/general-ledger';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LedgerFiltersProps {
    accounts: LedgerAccountOption[];
    fiscalYears: FiscalYearOption[];
    filters: GeneralLedgerFilters;
    routeName?: string;
    submitLabel?: string;
}

export function LedgerFilters({
    accounts,
    fiscalYears,
    filters,
    routeName = 'accounting.general-ledger.index',
    submitLabel = 'Generate ledger',
}: LedgerFiltersProps) {
    const [accountId, setAccountId] = useState<number | null>(filters.account_id);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [fiscalYearId, setFiscalYearId] = useState(
        filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all',
    );

    useEffect(() => {
        setAccountId(filters.account_id);
        setDateFrom(filters.date_from);
        setDateTo(filters.date_to);
        setFiscalYearId(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');
    }, [filters]);

    const apply = () => {
        if (!accountId || !dateFrom || !dateTo) {
            return;
        }

        const query: Record<string, string> = {
            account_id: String(accountId),
            date_from: dateFrom,
            date_to: dateTo,
        };

        if (fiscalYearId !== 'all') {
            query.fiscal_year_id = fiscalYearId;
        }

        if (filters.view) {
            query.view = filters.view;
        }

        router.get(route(routeName), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clear = () => {
        setAccountId(null);
        setDateFrom('');
        setDateTo('');
        setFiscalYearId('all');
        router.get(route(routeName), {}, { preserveState: true, replace: true });
    };

    const pickerAccounts = accounts.map((account) => ({
        id: account.id,
        account_code: account.account_code,
        account_name: account.account_name,
    }));

    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
                <Label>Account</Label>
                <AccountPicker accounts={pickerAccounts} value={accountId} onChange={setAccountId} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="gl-date-from">Date from</Label>
                <Input id="gl-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="gl-date-to">Date to</Label>
                <Input id="gl-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>

            <div className="space-y-2">
                <Label>Fiscal year (optional)</Label>
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

            <div className="flex items-end gap-2 lg:col-span-5">
                <Button type="button" onClick={apply} disabled={!accountId || !dateFrom || !dateTo}>
                    <Search className="mr-2 h-4 w-4" />
                    {submitLabel}
                </Button>
                <Button type="button" variant="outline" onClick={clear}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
