import type { JournalEntryStatus } from '@/types/journal-entry';

export const journalEntryStatusLabels: Record<JournalEntryStatus, string> = {
    draft: 'Draft',
    posted: 'Posted',
    reversed: 'Reversed',
    cancelled: 'Cancelled',
};
