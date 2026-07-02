import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookText,
    FileSpreadsheet,
    Gauge,
    ListTree,
    Scale,
    ScrollText,
    SplitSquareHorizontal,
} from 'lucide-react';

const workflowSteps = [
    { step: 1, title: 'Chart of Accounts', href: 'accounting.accounts.index', icon: ListTree },
    { step: 2, title: 'Journal Entries', href: 'accounting.journal-entries.index', icon: BookText },
    { step: 3, title: 'T-Accounts', href: 'accounting.t-accounts.index', icon: SplitSquareHorizontal },
    { step: 4, title: 'General Ledger', href: 'accounting.general-ledger.index', icon: ScrollText },
    { step: 5, title: 'Trial Balance', href: 'accounting.trial-balance.index', icon: Scale },
    { step: 6, title: 'Financial Statements', href: 'accounting.financial-statements.index', icon: FileSpreadsheet },
    { step: 7, title: 'Financial Analysis', href: 'financial-analysis.dashboard', icon: Gauge },
] as const;

interface AccountingWorkflowProps {
    currentStep?: number;
    className?: string;
}

export function AccountingWorkflow({ currentStep, className }: AccountingWorkflowProps) {
    return (
        <nav
            aria-label="Accounting cycle workflow"
            className={cn('overflow-x-auto rounded-xl border bg-card p-3', className)}
        >
            <ol className="flex min-w-max items-center gap-1">
                {workflowSteps.map((item, index) => {
                    const isActive = currentStep === item.step;
                    const isPast = currentStep !== undefined && item.step < currentStep;
                    const Icon = item.icon;

                    return (
                        <li key={item.step} className="flex items-center">
                            <Link
                                href={route(item.href)}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : isPast
                                          ? 'text-foreground hover:bg-muted'
                                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">{item.title}</span>
                            </Link>
                            {index < workflowSteps.length - 1 && (
                                <ArrowRight className="text-muted-foreground mx-1 h-3 w-3 shrink-0" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export { workflowSteps };
