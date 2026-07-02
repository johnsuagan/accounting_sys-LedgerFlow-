import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FiscalYearOption } from '@/types/general-ledger';
import type { TrialBalanceFilters } from '@/types/trial-balance';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrialBalanceFiltersProps {
    fiscalYears: FiscalYearOption[];
    filters: TrialBalanceFilters;
}

export function TrialBalanceFiltersBar({ fiscalYears, filters }: TrialBalanceFiltersProps) {
    const [asOfDate, setAsOfDate] = useState(filters.as_of_date);
    const [fiscalYearId, setFiscalYearId] = useState(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');

    useEffect(() => {
        setAsOfDate(filters.as_of_date);
        setFiscalYearId(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');
    }, [filters]);

    const apply = () => {
        if (!asOfDate) return;

        const query: Record<string, string> = { as_of_date: asOfDate };
        if (fiscalYearId !== 'all') query.fiscal_year_id = fiscalYearId;

        router.get(route('accounting.trial-balance.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clear = () => {
        setAsOfDate('');
        setFiscalYearId('all');
        router.get(route('accounting.trial-balance.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-4">
            <div className="space-y-2">
                <Label htmlFor="tb-as-of-date">As of date</Label>
                <Input id="tb-as-of-date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
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

            <div className="flex items-end gap-2 lg:col-span-2">
                <Button type="button" onClick={apply} disabled={!asOfDate}>
                    <Search className="mr-2 h-4 w-4" />
                    Generate trial balance
                </Button>
                <Button type="button" variant="outline" onClick={clear}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
