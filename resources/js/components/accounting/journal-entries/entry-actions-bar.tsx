import { Button } from '@/components/ui/button';
import type { JournalEntryPermissions } from '@/types/journal-entry';
import { router } from '@inertiajs/react';
import { Loader2, Save, Send, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface EntryActionsBarProps {
    entryId?: number;
    mode: 'create' | 'edit' | 'show';
    can: JournalEntryPermissions;
    readOnly?: boolean;
    isBalancedForPost?: boolean;
    formId?: string;
    onPost?: () => void;
    onReverse?: () => void;
    onPrint?: () => void;
}

export function EntryActionsBar({
    entryId,
    mode,
    can,
    readOnly = false,
    isBalancedForPost = false,
    formId = 'journal-entry-form',
    onPost,
    onReverse,
    onPrint,
}: EntryActionsBarProps) {
    const [posting, setPosting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const showWriteActions = !readOnly && can.write;

    const handlePost = () => {
        if (!entryId || onPost) {
            onPost?.();
            return;
        }

        setPosting(true);
        router.post(route('accounting.journal-entries.post', entryId), {}, {
            preserveScroll: true,
            onFinish: () => setPosting(false),
        });
    };

    const handleCancel = () => {
        if (!entryId) {
            return;
        }

        if (!confirm('Cancel this draft journal entry?')) {
            return;
        }

        setCancelling(true);
        router.post(route('accounting.journal-entries.cancel', entryId), {}, {
            onFinish: () => setCancelling(false),
        });
    };

    const handleDelete = () => {
        if (!entryId) {
            return;
        }

        if (!confirm('Delete this draft journal entry? This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        router.delete(route('accounting.journal-entries.destroy', entryId), {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <div className="flex flex-wrap gap-3">
            {showWriteActions && (mode === 'create' || mode === 'edit') && (
                <Button type="submit" form={formId}>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create draft' : 'Save draft'}
                </Button>
            )}

            {showWriteActions && mode === 'edit' && can.post && (
                <Button
                    type="button"
                    onClick={handlePost}
                    disabled={!isBalancedForPost || posting}
                >
                    {posting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Post entry
                </Button>
            )}

            {showWriteActions && mode === 'edit' && can.cancel && (
                <Button type="button" variant="outline" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Cancel draft
                </Button>
            )}

            {showWriteActions && mode === 'edit' && can.delete && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete draft
                </Button>
            )}

            {mode === 'show' && can.reverse && !readOnly && (
                <Button type="button" variant="outline" onClick={onReverse}>
                    Reverse entry
                </Button>
            )}

            {mode === 'show' && (
                <Button type="button" variant="outline" onClick={onPrint ?? (() => window.print())}>
                    Print
                </Button>
            )}
        </div>
    );
}
