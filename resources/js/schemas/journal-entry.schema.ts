import { z } from 'zod';

const journalLineSchema = z.object({
    account_id: z
        .union([z.number().int().positive(), z.null()])
        .refine((value) => value !== null, { message: 'Account is required.' }),
    line_number: z.number().int().min(1),
    description: z.string().max(255).nullable().optional(),
    debit: z.coerce.number().min(0, 'Debit cannot be negative.'),
    credit: z.coerce.number().min(0, 'Credit cannot be negative.'),
});

export const journalEntryFormSchema = z
    .object({
        entry_date: z.string().min(1, 'Entry date is required.'),
        description: z.string().min(1, 'Description is required.').max(255),
        reference: z.string().max(100).nullable().optional(),
        memo: z.string().nullable().optional(),
        lines: z.array(journalLineSchema).min(1, 'At least one journal line is required.'),
    })
    .superRefine((data, ctx) => {
        data.lines.forEach((line, index) => {
            const hasDebit = line.debit > 0;
            const hasCredit = line.credit > 0;

            if (hasDebit && hasCredit) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'A line cannot have both a debit and a credit.',
                    path: ['lines', index, 'debit'],
                });
            }
        });
    });

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

export const reverseEntrySchema = z.object({
    reversal_reason: z.string().min(1, 'Reversal reason is required.').max(65535),
    reversal_date: z.string().optional(),
});

export type ReverseEntryFormValues = z.infer<typeof reverseEntrySchema>;
