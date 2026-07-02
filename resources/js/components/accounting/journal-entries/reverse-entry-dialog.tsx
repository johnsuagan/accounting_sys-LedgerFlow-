import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reverseEntrySchema, type ReverseEntryFormValues } from '@/schemas/journal-entry.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

interface ReverseEntryDialogProps {
    entryId: number;
    defaultDate?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReverseEntryDialog({ entryId, defaultDate, open, onOpenChange }: ReverseEntryDialogProps) {
    const form = useForm<ReverseEntryFormValues>({
        resolver: zodResolver(reverseEntrySchema),
        defaultValues: {
            reversal_reason: '',
            reversal_date: defaultDate ?? '',
        },
    });

    const submit = form.handleSubmit((values) => {
        router.post(
            route('accounting.journal-entries.reverse', entryId),
            {
                reversal_reason: values.reversal_reason,
                reversal_date: values.reversal_date || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                },
            },
        );
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reverse journal entry</DialogTitle>
                    <DialogDescription>
                        This will create a posted reversal entry with swapped debits and credits. The original entry will
                        be marked as reversed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reversal_date">Reversal date</Label>
                        <Input id="reversal_date" type="date" {...form.register('reversal_date')} />
                        <InputError message={form.formState.errors.reversal_date?.message} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reversal_reason">Reversal reason</Label>
                        <Textarea id="reversal_reason" {...form.register('reversal_reason')} />
                        <InputError message={form.formState.errors.reversal_reason?.message} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            Reverse entry
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
