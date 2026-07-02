import { Badge } from '@/components/ui/badge';
import { accountTypeLabels } from '@/lib/accounting-labels';
import type { AccountType } from '@/types/accounting';

const typeVariants: Record<AccountType, string> = {
    asset: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    liability: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    equity: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
    revenue: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    expense: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
};

export function AccountTypeBadge({ type }: { type: AccountType }) {
    return <Badge className={typeVariants[type]}>{accountTypeLabels[type]}</Badge>;
}
