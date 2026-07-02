import { AttachmentList } from '@/components/accounting/journal-entries/attachment-list';
import { AttachmentUpload } from '@/components/accounting/journal-entries/attachment-upload';
import { EntryActionsBar } from '@/components/accounting/journal-entries/entry-actions-bar';
import { EntryStatusBadge } from '@/components/accounting/journal-entries/entry-status-badge';
import { JournalEntryForm } from '@/components/accounting/journal-entries/journal-entry-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { displayEntryNumber } from '@/lib/journal-entry-math';
import AppLayout from '@/layouts/app-layout';
import type { JournalEntryFormValues } from '@/schemas/journal-entry.schema';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { JournalEntryDetail, JournalEntryEnums, JournalEntryPermissions, PostableAccount } from '@/types/journal-entry';
import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface EditJournalEntryProps {
    entry: JournalEntryDetail;
    postableAccounts: PostableAccount[];
    enums: JournalEntryEnums;
    can: JournalEntryPermissions;
}

export default function EditJournalEntry({ entry, postableAccounts, can }: EditJournalEntryProps) {
    const { flash, company } = usePage<SharedData>().props;
    const readOnly = !can.write || company?.current?.role === 'auditor';
    const [isBalancedForPost, setIsBalancedForPost] = useState(entry.is_balanced && entry.lines.length >= 2);
    const pendingPostRef = useRef(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journal Entries', href: route('accounting.journal-entries.index') },
        { title: displayEntryNumber(entry.entry_number, entry.status), href: route('accounting.journal-entries.edit', entry.id) },
    ];

    const handleSubmit = (values: JournalEntryFormValues) => {
        router.put(route('accounting.journal-entries.update', entry.id), values, {
            preserveScroll: true,
            onSuccess: () => {
                if (pendingPostRef.current) {
                    pendingPostRef.current = false;
                    router.post(route('accounting.journal-entries.post', entry.id), {}, { preserveScroll: true });
                }
            },
        });
    };

    const handlePost = () => {
        pendingPostRef.current = true;
        document.getElementById('journal-entry-form')?.requestSubmit();
    };

    const handleDeleteAttachment = (attachmentId: number) => {
        if (!confirm('Delete this attachment?')) {
            return;
        }

        router.delete(route('accounting.journal-entries.attachments.destroy', [entry.id, attachmentId]), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${displayEntryNumber(entry.entry_number, entry.status)}`} />

            <div className="mx-auto max-w-6xl space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <CardTitle>{displayEntryNumber(entry.entry_number, entry.status)}</CardTitle>
                            <EntryStatusBadge status={entry.status} />
                        </div>
                        <EntryActionsBar
                            entryId={entry.id}
                            mode="edit"
                            can={can}
                            readOnly={readOnly}
                            isBalancedForPost={isBalancedForPost}
                            onPost={handlePost}
                        />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <JournalEntryForm
                            mode="edit"
                            entry={entry}
                            postableAccounts={postableAccounts}
                            readOnly={readOnly}
                            onSubmit={handleSubmit}
                            onBalanceChange={setIsBalancedForPost}
                        />

                        <div className="space-y-4 border-t pt-6">
                            <h2 className="text-lg font-medium">Attachments</h2>
                            {!readOnly && can.uploadAttachment && <AttachmentUpload entryId={entry.id} />}
                            <AttachmentList
                                attachments={entry.attachments}
                                readOnly={readOnly || !can.uploadAttachment}
                                onDelete={handleDeleteAttachment}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
