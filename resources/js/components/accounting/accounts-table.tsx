import { AccountDeactivateDialog } from '@/components/accounting/account-deactivate-dialog';
import { AccountTraceLinks } from '@/components/accounting/account-trace-links';
import { AccountTypeBadge } from '@/components/accounting/account-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Account } from '@/types/accounting';
import { Link } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AccountsTableProps {
    accounts: Account[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    readOnly: boolean;
}

export function AccountsTable({ accounts, selectedId, onSelect, readOnly }: AccountsTableProps) {
    const [deactivateAccount, setDeactivateAccount] = useState<Account | null>(null);

    const columns = useMemo<ColumnDef<Account>[]>(
        () => [
            {
                accessorKey: 'account_code',
                header: 'Code',
                cell: ({ row }) => <span className="font-mono text-sm">{row.original.account_code}</span>,
            },
            {
                accessorKey: 'account_name',
                header: 'Name',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span>{row.original.account_name}</span>
                        {row.original.is_header && <Badge variant="outline">Header</Badge>}
                        {row.original.is_system && <Badge variant="secondary">System</Badge>}
                    </div>
                ),
            },
            {
                accessorKey: 'account_type',
                header: 'Type',
                cell: ({ row }) => <AccountTypeBadge type={row.original.account_type} />,
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                ),
            },
            {
                id: 'trace',
                header: 'Trace',
                cell: ({ row }) =>
                    row.original.is_header ? null : (
                        <AccountTraceLinks accountId={row.original.id} accountType={row.original.account_type} />
                    ),
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => {
                    if (readOnly) {
                        return null;
                    }

                    const account = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={route('accounting.accounts.edit', account.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                {account.is_active && !account.is_system && (
                                    <DropdownMenuItem onClick={() => setDeactivateAccount(account)}>Deactivate</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [readOnly],
    );

    const table = useReactTable({
        data: accounts,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="overflow-hidden rounded-xl border">
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
                                    No accounts found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-muted/40 border-b ${selectedId === row.original.id ? 'bg-muted/60' : ''}`}
                                    onClick={() => onSelect(row.original.id)}
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

            {deactivateAccount && (
                <AccountDeactivateDialog account={deactivateAccount} open={!!deactivateAccount} onOpenChange={() => setDeactivateAccount(null)} />
            )}
        </>
    );
}
