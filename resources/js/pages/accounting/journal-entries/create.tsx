import { EntryActionsBar } from '@/components/accounting/journal-entries/entry-actions-bar';
import { JournalEntryForm } from '@/components/accounting/journal-entries/journal-entry-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { JournalEntryFormValues } from '@/schemas/journal-entry.schema';
import type { BreadcrumbItem } from '@/types';
import type { JournalEntryEnums, PostableAccount } from '@/types/journal-entry';
import { Head, router } from '@inertiajs/react';

interface CreateJournalEntryProps {
    postableAccounts: PostableAccount[];
    enums: JournalEntryEnums;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Journal Entries', href: route('accounting.journal-entries.index') },
    { title: 'New entry', href: route('accounting.journal-entries.create') },
];

export default function CreateJournalEntry({ postableAccounts }: CreateJournalEntryProps) {
    const handleSubmit = (values: JournalEntryFormValues) => {
        router.post(route('accounting.journal-entries.store'), values);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New journal entry" />

            <div className="mx-auto max-w-6xl space-y-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle>New journal entry</CardTitle>
                        <EntryActionsBar mode="create" can={{ write: true, update: true, delete: false, post: false, cancel: false, reverse: false, uploadAttachment: false }} />
                    </CardHeader>
                    <CardContent>
                        <JournalEntryForm mode="create" postableAccounts={postableAccounts} onSubmit={handleSubmit} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
