import { BalanceIndicator } from '@/components/accounting/journal-entries/balance-indicator';
import { JournalEntryLines, createEmptyLine } from '@/components/accounting/journal-entries/journal-entry-lines';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { balanceState, calculateTotals, canPost } from '@/lib/journal-entry-math';
import { journalEntryFormSchema, type JournalEntryFormValues } from '@/schemas/journal-entry.schema';
import type { JournalEntryDetail, PostableAccount } from '@/types/journal-entry';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface JournalEntryFormProps {
    mode: 'create' | 'edit';
    entry?: JournalEntryDetail;
    postableAccounts: PostableAccount[];
    readOnly?: boolean;
    onSubmit: (values: JournalEntryFormValues) => void;
    onBalanceChange?: (isBalancedForPost: boolean) => void;
    children?: React.ReactNode;
}

function defaultLinesFromEntry(entry?: JournalEntryDetail) {
    if (entry?.lines?.length) {
        return entry.lines.map((line) => ({
            account_id: line.account_id,
            line_number: line.line_number,
            description: line.description ?? '',
            debit: line.debit,
            credit: line.credit,
        }));
    }

    return [createEmptyLine(1)];
}

export function JournalEntryForm({
    mode,
    entry,
    postableAccounts,
    readOnly = false,
    onSubmit,
    onBalanceChange,
    children,
}: JournalEntryFormProps) {
    const { errors: serverErrors } = usePage<{ errors: Record<string, string> }>().props;

    const form = useForm<JournalEntryFormValues>({
        resolver: zodResolver(journalEntryFormSchema),
        defaultValues: {
            entry_date: entry?.entry_date ?? new Date().toISOString().slice(0, 10),
            description: entry?.description ?? '',
            reference: entry?.reference ?? '',
            memo: entry?.memo ?? '',
            lines: defaultLinesFromEntry(entry),
        },
    });

    const lines = form.watch('lines');
    const totals = calculateTotals(lines);
    const state = balanceState(lines);
    const isBalancedForPost = canPost(lines);

    useEffect(() => {
        onBalanceChange?.(isBalancedForPost);
    }, [isBalancedForPost, onBalanceChange]);

    const handleSubmit = form.handleSubmit((values) => {
        onSubmit({
            ...values,
            reference: values.reference || null,
            memo: values.memo || null,
            lines: values.lines.map((line, index) => ({
                ...line,
                account_id: line.account_id as number,
                line_number: index + 1,
                description: line.description || null,
                debit: Number(line.debit) || 0,
                credit: Number(line.credit) || 0,
            })),
        });
    });

    const serverError = serverErrors.journal_entry;

    return (
        <form id="journal-entry-form" onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    {serverError}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="entry_date">Entry date</Label>
                    <Input id="entry_date" type="date" disabled={readOnly} {...form.register('entry_date')} />
                    <InputError message={form.formState.errors.entry_date?.message || serverErrors.entry_date} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input id="reference" disabled={readOnly} {...form.register('reference')} />
                    <InputError message={form.formState.errors.reference?.message || serverErrors.reference} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" disabled={readOnly} {...form.register('description')} />
                    <InputError message={form.formState.errors.description?.message || serverErrors.description} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="memo">Memo</Label>
                    <Textarea id="memo" disabled={readOnly} {...form.register('memo')} />
                    <InputError message={serverErrors.memo} />
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-medium">Journal lines</h2>
                <Controller
                    control={form.control}
                    name="lines"
                    render={({ field }) => (
                        <JournalEntryLines
                            lines={field.value}
                            accounts={postableAccounts}
                            readOnly={readOnly}
                            onChange={field.onChange}
                        />
                    )}
                />
                <InputError message={form.formState.errors.lines?.message || serverErrors.lines} />
            </div>

            <BalanceIndicator
                totalDebit={totals.totalDebit}
                totalCredit={totals.totalCredit}
                difference={totals.difference}
                state={state}
            />

            {children}
        </form>
    );
}
