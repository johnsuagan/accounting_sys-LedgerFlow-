import { Button } from '@/components/ui/button';
import { formatBalanceDisplay, formatLedgerAmount, formatLedgerDate } from '@/lib/general-ledger-format';
import { cn } from '@/lib/utils';
import type { GeneralLedgerLine } from '@/types/general-ledger';
import { Link } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';

interface LedgerTableProps {
    lines: GeneralLedgerLine[];
}

export function LedgerTable({ lines }: LedgerTableProps) {
    const columns = useMemo<ColumnDef<GeneralLedgerLine>[]>(
        () => [
            {
                accessorKey: 'date',
                header: 'Date',
                cell: ({ row }) => formatLedgerDate(row.original.date),
            },
            {
                accessorKey: 'entry_number',
                header: 'Entry No.',
                cell: ({ row }) => {
                    const line = row.original;

                    if (line.is_opening_balance || !line.journal_entry_id) {
                        return <span className="font-medium">{line.entry_number}</span>;
                    }

                    return (
                        <Link
                            href={route('accounting.journal-entries.show', line.journal_entry_id)}
                            className="text-primary font-mono hover:underline"
                        >
                            {line.entry_number}
                        </Link>
                    );
                },
            },
            {
                accessorKey: 'reference',
                header: 'Reference',
                cell: ({ row }) => row.original.reference || '—',
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => <span className="line-clamp-2">{row.original.description}</span>,
            },
            {
                accessorKey: 'debit',
                header: () => <span className="block text-right">Debit</span>,
                cell: ({ row }) => (
                    <span className="block text-right font-mono">
                        {Number(row.original.debit) > 0 ? formatLedgerAmount(row.original.debit) : ''}
                    </span>
                ),
            },
            {
                accessorKey: 'credit',
                header: () => <span className="block text-right">Credit</span>,
                cell: ({ row }) => (
                    <span className="block text-right font-mono">
                        {Number(row.original.credit) > 0 ? formatLedgerAmount(row.original.credit) : ''}
                    </span>
                ),
            },
            {
                id: 'balance',
                header: () => <span className="block text-right">Balance</span>,
                cell: ({ row }) => (
                    <span className="block text-right font-mono font-medium">
                        {formatBalanceDisplay(row.original.balance_amount, row.original.balance_side)}
                    </span>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: lines,
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
                                    No ledger activity in this period.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        'border-b',
                                        row.original.is_opening_balance ? 'bg-muted/30 font-medium' : 'hover:bg-muted/40',
                                    )}
                                >
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
                {lines.length === 0 ? (
                    <p className="text-muted-foreground rounded-xl border px-4 py-8 text-center text-sm">
                        No ledger activity in this period.
                    </p>
                ) : (
                    lines.map((line, index) => (
                        <div
                            key={`${line.journal_entry_line_id ?? 'opening'}-${index}`}
                            className={cn('rounded-xl border p-4', line.is_opening_balance && 'bg-muted/30')}
                        >
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-sm font-medium">
                                        {line.is_opening_balance ? line.entry_number : line.entry_number || '—'}
                                    </p>
                                    <p className="text-muted-foreground text-sm">{formatLedgerDate(line.date)}</p>
                                </div>
                                <p className="font-mono text-sm font-semibold">
                                    {formatBalanceDisplay(line.balance_amount, line.balance_side)}
                                </p>
                            </div>
                            <p className="mb-2">{line.description}</p>
                            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Debit</p>
                                    <p>{Number(line.debit) > 0 ? formatLedgerAmount(line.debit) : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Credit</p>
                                    <p>{Number(line.credit) > 0 ? formatLedgerAmount(line.credit) : '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

interface LedgerSummaryProps {
    totalDebit: string;
    totalCredit: string;
    closingBalanceAmount: string;
    closingBalanceSide: string;
}

export function LedgerSummary({ totalDebit, totalCredit, closingBalanceAmount, closingBalanceSide }: LedgerSummaryProps) {
    return (
        <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3">
            <div>
                <p className="text-muted-foreground text-xs uppercase">Period debits</p>
                <p className="font-mono text-lg font-semibold">{formatLedgerAmount(totalDebit)}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs uppercase">Period credits</p>
                <p className="font-mono text-lg font-semibold">{formatLedgerAmount(totalCredit)}</p>
            </div>
            <div>
                <p className="text-muted-foreground text-xs uppercase">Closing balance</p>
                <p className="font-mono text-lg font-semibold">
                    {formatBalanceDisplay(closingBalanceAmount, closingBalanceSide)}
                </p>
            </div>
        </div>
    );
}

interface LedgerExportBarProps {
    disabled?: boolean;
}

export function LedgerExportBar({ disabled = true }: LedgerExportBarProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={disabled} title="Coming soon">
                Export CSV
            </Button>
            <Button type="button" variant="outline" disabled={disabled} title="Coming soon">
                Export PDF
            </Button>
        </div>
    );
}
