import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountTypeLabels } from '@/lib/accounting-labels';
import type { AccountFilters, AccountType } from '@/types/accounting';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AccountFiltersProps {
    filters: AccountFilters;
    accountTypes: AccountType[];
}

export function AccountFiltersBar({ filters, accountTypes }: AccountFiltersProps) {
    const [search, setSearch] = useState(filters.search);
    const [accountType, setAccountType] = useState(filters.account_type || 'all');
    const [isActive, setIsActive] = useState(
        filters.is_active === null ? 'all' : filters.is_active ? 'active' : 'inactive',
    );

    useEffect(() => {
        setSearch(filters.search);
        setAccountType(filters.account_type || 'all');
        setIsActive(filters.is_active === null ? 'all' : filters.is_active ? 'active' : 'inactive');
    }, [filters]);

    const applyFilters = () => {
        const query: Record<string, string> = {};

        if (search.trim()) {
            query.search = search.trim();
        }

        if (accountType !== 'all') {
            query.account_type = accountType;
        }

        if (isActive !== 'all') {
            query.is_active = isActive === 'active' ? '1' : '0';
        }

        router.get(route('accounting.accounts.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setAccountType('all');
        setIsActive('all');
        router.get(route('accounting.accounts.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="account-search">Search</Label>
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                        id="account-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search by code, name, or description"
                        className="pl-9"
                    />
                </div>
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
                                {accountTypeLabels[type]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={isActive} onValueChange={setIsActive}>
                    <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end gap-2 md:col-span-4">
                <Button type="button" onClick={applyFilters}>
                    Apply filters
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
