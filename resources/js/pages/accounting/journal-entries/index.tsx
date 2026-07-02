import { JournalEntriesTable, JournalEntryFilters, filterJournalEntries } from '@/components/accounting/journal-entries/journal-entries-table';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Paginated, SharedData } from '@/types';
import type { JournalEntryEnums, JournalEntryIndexFilters, JournalEntrySummary } from '@/types/journal-entry';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface JournalEntriesIndexProps {
    entries: Paginated<JournalEntrySummary>;
    enums: JournalEntryEnums;
    can: {
        create: boolean;
        write: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Journal Entries', href: route('accounting.journal-entries.index') },
];

const emptyFilters: JournalEntryIndexFilters = {
    search: '',
    status: '',
    date_from: '',
    date_to: '',
};

export default function JournalEntriesIndex({ entries, enums, can }: JournalEntriesIndexProps) {
    const { flash, company } = usePage<SharedData>().props;
    const readOnly = !can.write || company?.current?.role === 'auditor';
    const [filters, setFilters] = useState<JournalEntryIndexFilters>(emptyFilters);

    const filteredEntries = useMemo(() => filterJournalEntries(entries.data, filters), [entries.data, filters]);

    const handlePageChange = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal Entries" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={2} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Journal Entries</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage draft, posted, and reversed journal entries for {company?.current?.name ?? 'your company'}
                        </p>
                    </div>
                    {!readOnly && can.create && (
                        <Button asChild>
                            <Link href={route('accounting.journal-entries.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                New journal entry
                            </Link>
                        </Button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                {readOnly && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                        You have read-only access. Journal entry changes are disabled for auditors.
                    </div>
                )}

                <JournalEntryFilters filters={filters} statuses={enums.statuses} onChange={setFilters} />

                <JournalEntriesTable entries={filteredEntries} readOnly={readOnly} />

                {entries.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-muted-foreground text-sm">
                            Showing {entries.from ?? 0}–{entries.to ?? 0} of {entries.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {entries.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    onClick={() => handlePageChange(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
