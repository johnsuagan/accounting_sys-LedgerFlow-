import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalysisFilters, ComparisonType } from '@/types/financial-analysis';
import type { FiscalYearOption } from '@/types/general-ledger';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalysisFiltersBarProps {
    filters: AnalysisFilters;
    fiscalYears: FiscalYearOption[];
    routeName: string;
}

export function AnalysisFiltersBar({ filters, fiscalYears, routeName }: AnalysisFiltersBarProps) {
    const [asOfDate, setAsOfDate] = useState(filters.as_of_date);
    const [comparisonType, setComparisonType] = useState<ComparisonType>(filters.comparison_type);
    const [fiscalYearId, setFiscalYearId] = useState(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');

    useEffect(() => {
        setAsOfDate(filters.as_of_date);
        setComparisonType(filters.comparison_type);
        setFiscalYearId(filters.fiscal_year_id ? String(filters.fiscal_year_id) : 'all');
    }, [filters]);

    const apply = () => {
        if (!asOfDate) return;

        const query: Record<string, string> = {
            as_of_date: asOfDate,
            comparison_type: comparisonType,
        };

        if (fiscalYearId !== 'all') query.fiscal_year_id = fiscalYearId;

        router.get(route(routeName), query, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clear = () => {
        router.get(route(routeName), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4 print:hidden">
            <div className="space-y-2">
                <Label htmlFor="as_of_date">As of date</Label>
                <Input id="as_of_date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Compare with</Label>
                <Select value={comparisonType} onValueChange={(v) => setComparisonType(v as ComparisonType)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Previous month</SelectItem>
                        <SelectItem value="quarter">Previous quarter</SelectItem>
                        <SelectItem value="year">Previous year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Fiscal year</Label>
                <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {fiscalYears.map((fy) => (
                            <SelectItem key={fy.id} value={String(fy.id)}>
                                {fy.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button type="button" onClick={apply}>
                    <Search className="mr-2 h-4 w-4" />
                    Apply
                </Button>
                <Button type="button" variant="outline" onClick={clear}>
                    <X className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>
        </div>
    );
}
