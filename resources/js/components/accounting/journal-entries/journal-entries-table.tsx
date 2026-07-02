import { EntryStatusBadge } from '@/components/accounting/journal-entries/entry-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { displayEntryNumber, formatCurrency } from '@/lib/journal-entry-math';
import { journalEntryStatusLabels } from '@/lib/journal-entry-labels';
import type { JournalEntryIndexFilters, JournalEntryStatus, JournalEntrySummary } from '@/types/journal-entry';
import { Link } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface JournalEntryFiltersProps {
    filters: JournalEntryIndexFilters;
    statuses: JournalEntryStatus[];
    onChange: (filters: JournalEntryIndexFilters) => void;
}

export function JournalEntryFilters({ filters, statuses, onChange }: JournalEntryFiltersProps) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const apply = () => {
        onChange({
            search: search.trim(),
            status: status === 'all' ? '' : status,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const clear = () => {
        const empty = { search: '', status: '', date_from: '', date_to: '' };
        setSearch('');
        setStatus('all');
        setDateFrom('');
        setDateTo('');
        onChange(empty);
    };

    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="journal-search">Search</Label>
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                        id="journal-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && apply()}
                        placeholder="Search by number, description, or reference"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statuses.map((item) => (
                            <SelectItem key={item} value={item}>
                                {journalEntryStatusLabels[item]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="date-from">Date from</Label>
                <Input id="date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="date-to">Date to</Label>
                <Input id="date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>

            <div className="flex items-end gap-2 lg:col-span-5">
                <Button type="button" onClick={apply}>
                    Apply filters
                </Button>
                <Button type="button" variant="outline" onClick={clear}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}

interface JournalEntriesTableProps {
    entries: JournalEntrySummary[];
    readOnly?: boolean;
}

export function JournalEntriesTable({ entries, readOnly }: JournalEntriesTableProps) {
    const columns = useMemo<ColumnDef<JournalEntrySummary>[]>(
        () => [
            {
                accessorKey: 'entry_number',
                header: 'Entry #',
                cell: ({ row }) => (
                    <span className="font-mono text-sm">
                        {displayEntryNumber(row.original.entry_number, row.original.status)}
                    </span>
                ),
            },
            {
                accessorKey: 'entry_date',
                header: 'Date',
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => <span className="line-clamp-1">{row.original.description}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => <EntryStatusBadge status={row.original.status} />,
            },
            {
                id: 'totals',
                header: 'Debit / Credit',
                cell: ({ row }) => (
                    <span className="font-mono text-sm">
                        {formatCurrency(Number(row.original.total_debit))} / {formatCurrency(Number(row.original.total_credit))}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => {
                    const entry = row.original;
                    const href =
                        entry.status === 'draft' && !readOnly
                            ? route('accounting.journal-entries.edit', entry.id)
                            : route('accounting.journal-entries.show', entry.id);

                    return (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={href}>{entry.status === 'draft' && !readOnly ? 'Edit' : 'View'}</Link>
                        </Button>
                    );
                },
            },
        ],
        [readOnly],
    );

    const table = useReactTable({
        data: entries,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-4 py-3 text-left font-medium">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-muted-foreground px-4 py-8 text-center">
                                    No journal entries found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-muted/40 border-b">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3 md:hidden">
                {entries.length === 0 ? (
                    <p className="text-muted-foreground rounded-xl border px-4 py-8 text-center text-sm">No journal entries found.</p>
                ) : (
                    entries.map((entry) => {
                        const href =
                            entry.status === 'draft' && !readOnly
                                ? route('accounting.journal-entries.edit', entry.id)
                                : route('accounting.journal-entries.show', entry.id);

                        return (
                            <Link
                                key={entry.id}
                                href={href}
                                className="hover:bg-muted/40 block rounded-xl border p-4 transition-colors"
                            >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-sm font-medium">
                                            {displayEntryNumber(entry.entry_number, entry.status)}
                                        </p>
                                        <p className="text-muted-foreground text-sm">{entry.entry_date}</p>
                                    </div>
                                    <EntryStatusBadge status={entry.status} />
                                </div>
                                <p className="mb-2 font-medium">{entry.description}</p>
                                <p className="text-muted-foreground font-mono text-sm">
                                    {formatCurrency(Number(entry.total_debit))} / {formatCurrency(Number(entry.total_credit))}
                                </p>
                            </Link>
                        );
                    })
                )}
            </div>
        </>
    );
}

export function filterJournalEntries(
    entries: JournalEntrySummary[],
    filters: JournalEntryIndexFilters,
): JournalEntrySummary[] {
    return entries.filter((entry) => {
        if (filters.status && entry.status !== filters.status) {
            return false;
        }

        if (filters.date_from && entry.entry_date < filters.date_from) {
            return false;
        }

        if (filters.date_to && entry.entry_date > filters.date_to) {
            return false;
        }

        if (filters.search) {
            const query = filters.search.toLowerCase();
            const haystack = [
                entry.entry_number ?? '',
                entry.description,
                entry.status,
                displayEntryNumber(entry.entry_number, entry.status),
            ]
                .join(' ')
                .toLowerCase();

            if (!haystack.includes(query)) {
                return false;
            }
        }

        return true;
    });
}
