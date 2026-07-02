import { AttachmentList } from '@/components/accounting/journal-entries/attachment-list';
import { AccountTraceLinks } from '@/components/accounting/account-trace-links';
import { EntryActionsBar } from '@/components/accounting/journal-entries/entry-actions-bar';
import { EntryStatusBadge } from '@/components/accounting/journal-entries/entry-status-badge';
import { ReverseEntryDialog } from '@/components/accounting/journal-entries/reverse-entry-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { displayEntryNumber, formatCurrency } from '@/lib/journal-entry-math';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { JournalEntryDetail, JournalEntryPermissions } from '@/types/journal-entry';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface ShowJournalEntryProps {
    entry: JournalEntryDetail;
    can: JournalEntryPermissions;
}

export default function ShowJournalEntry({ entry, can }: ShowJournalEntryProps) {
    const { flash, company } = usePage<SharedData>().props;
    const readOnly = !can.write || company?.current?.role === 'auditor';
    const [showReverse, setShowReverse] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journal Entries', href: route('accounting.journal-entries.index') },
        { title: displayEntryNumber(entry.entry_number, entry.status), href: route('accounting.journal-entries.show', entry.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={displayEntryNumber(entry.entry_number, entry.status)} />

            <div className="mx-auto max-w-6xl space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3">
                            <CardTitle className="font-mono">{displayEntryNumber(entry.entry_number, entry.status)}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <EntryStatusBadge status={entry.status} />
                                <Badge variant="outline">{entry.source}</Badge>
                                {entry.is_balanced && <Badge variant="outline">Balanced</Badge>}
                            </div>
                            <p className="text-lg font-medium">{entry.description}</p>
                            {entry.reference && <p className="text-muted-foreground text-sm">Reference: {entry.reference}</p>}
                            {entry.memo && <p className="text-muted-foreground text-sm">Memo: {entry.memo}</p>}
                        </div>
                        <EntryActionsBar
                            entryId={entry.id}
                            mode="show"
                            can={can}
                            readOnly={readOnly}
                            onReverse={() => setShowReverse(true)}
                        />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Entry date</p>
                                <p className="font-medium">{entry.entry_date}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Posted date</p>
                                <p className="font-medium">{entry.posted_at ? new Date(entry.posted_at).toLocaleString() : '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Posted by</p>
                                <p className="font-medium">{entry.posted_by?.name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Fiscal period</p>
                                <p className="font-medium">
                                    {entry.fiscal_year?.name ?? '—'}
                                    {entry.accounting_period?.name ? ` / ${entry.accounting_period.name}` : ''}
                                </p>
                            </div>
                        </div>

                        {(entry.reversal_of || entry.reversed_by || entry.reversal_reason) && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-2 font-medium">Reversal details</h2>
                                {entry.reversal_of && (
                                    <p className="text-sm">
                                        Reverses{' '}
                                        <Link className="text-primary underline" href={route('accounting.journal-entries.show', entry.reversal_of.id)}>
                                            {entry.reversal_of.entry_number ?? 'entry'}
                                        </Link>
                                    </p>
                                )}
                                {entry.reversed_by && (
                                    <p className="text-sm">
                                        Reversed by{' '}
                                        <Link className="text-primary underline" href={route('accounting.journal-entries.show', entry.reversed_by.id)}>
                                            {entry.reversed_by.entry_number ?? 'entry'}
                                        </Link>
                                    </p>
                                )}
                                {entry.reversal_reason && <p className="text-muted-foreground mt-2 text-sm">{entry.reversal_reason}</p>}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Journal lines</h2>
                                <p className="font-mono text-sm">
                                    {formatCurrency(Number(entry.total_debit))} / {formatCurrency(Number(entry.total_credit))}
                                </p>
                            </div>

                            <div className="hidden overflow-hidden rounded-xl border md:block">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Account</th>
                                            <th className="px-4 py-3 text-left font-medium">Description</th>
                                            <th className="px-4 py-3 text-right font-medium">Debit</th>
                                            <th className="px-4 py-3 text-right font-medium">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.lines.map((line) => (
                                            <tr key={line.id ?? line.line_number} className="border-b">
                                                <td className="px-4 py-3">
                                                    <p>
                                                        <span className="font-mono">{line.account_code}</span> — {line.account_name}
                                                    </p>
                                                    {line.account_id && line.account_type && (
                                                        <AccountTraceLinks
                                                            accountId={line.account_id}
                                                            accountType={line.account_type}
                                                            dateFrom={entry.entry_date}
                                                            dateTo={entry.entry_date}
                                                            className="mt-1"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{line.description || '—'}</td>
                                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(line.debit))}</td>
                                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(line.credit))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-3 md:hidden">
                                {entry.lines.map((line) => (
                                    <div key={line.id ?? line.line_number} className="rounded-xl border p-4">
                                        <p className="font-medium">
                                            <span className="font-mono">{line.account_code}</span> — {line.account_name}
                                        </p>
                                        {line.description && <p className="text-muted-foreground mt-1 text-sm">{line.description}</p>}
                                        <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-sm">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Debit</p>
                                                <p>{formatCurrency(Number(line.debit))}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Credit</p>
                                                <p>{formatCurrency(Number(line.credit))}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-lg font-medium">Attachments</h2>
                            <AttachmentList attachments={entry.attachments} readOnly />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ReverseEntryDialog
                entryId={entry.id}
                defaultDate={entry.entry_date}
                open={showReverse}
                onOpenChange={setShowReverse}
            />
        </AppLayout>
    );
}
