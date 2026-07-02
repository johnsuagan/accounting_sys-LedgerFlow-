import { Badge } from '@/components/ui/badge';
import { journalEntryStatusLabels } from '@/lib/journal-entry-labels';
import { cn } from '@/lib/utils';
import type { JournalEntryStatus } from '@/types/journal-entry';

const statusVariants: Record<JournalEntryStatus, string> = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    posted: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    reversed: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

interface EntryStatusBadgeProps {
    status: JournalEntryStatus;
    className?: string;
}

export function EntryStatusBadge({ status, className }: EntryStatusBadgeProps) {
    return (
        <Badge variant="outline" className={cn('border-transparent', statusVariants[status], className)}>
            {journalEntryStatusLabels[status]}
        </Badge>
    );
}
