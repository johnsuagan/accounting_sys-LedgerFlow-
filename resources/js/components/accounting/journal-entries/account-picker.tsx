import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PostableAccount } from '@/types/journal-entry';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface AccountPickerProps {
    accounts: PostableAccount[];
    value: number | null;
    onChange: (accountId: number) => void;
    disabled?: boolean;
    className?: string;
}

export function AccountPicker({ accounts, value, onChange, disabled = false, className }: AccountPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = accounts.find((account) => account.id === value) ?? null;

    const filteredAccounts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return accounts;
        }

        return accounts.filter(
            (account) =>
                account.account_code.toLowerCase().includes(query) ||
                account.account_name.toLowerCase().includes(query) ||
                `${account.account_code} - ${account.account_name}`.toLowerCase().includes(query),
        );
    }, [accounts, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="w-full justify-between font-normal"
                onClick={() => setOpen((current) => !current)}
            >
                <span className="truncate text-left">
                    {selected ? `${selected.account_code} - ${selected.account_name}` : 'Select account'}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
                    <div className="p-2">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search accounts..."
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto p-1">
                        {filteredAccounts.length === 0 ? (
                            <li className="text-muted-foreground px-3 py-2 text-sm">No accounts found.</li>
                        ) : (
                            filteredAccounts.map((account) => (
                                <li key={account.id}>
                                    <button
                                        type="button"
                                        className={cn(
                                            'hover:bg-muted flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm',
                                            value === account.id && 'bg-muted',
                                        )}
                                        onClick={() => {
                                            onChange(account.id);
                                            setOpen(false);
                                            setSearch('');
                                        }}
                                    >
                                        <Check className={cn('h-4 w-4', value === account.id ? 'opacity-100' : 'opacity-0')} />
                                        <span className="truncate">
                                            {account.account_code} - {account.account_name}
                                        </span>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
