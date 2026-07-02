import { z } from 'zod';

const accountTypeSchema = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']);

const accountSubtypeSchema = z.enum([
    'current_asset',
    'non_current_asset',
    'current_liability',
    'non_current_liability',
    'equity',
    'revenue',
    'expense',
]);

const subtypeByType: Record<z.infer<typeof accountTypeSchema>, z.infer<typeof accountSubtypeSchema>[]> = {
    asset: ['current_asset', 'non_current_asset'],
    liability: ['current_liability', 'non_current_liability'],
    equity: ['equity'],
    revenue: ['revenue'],
    expense: ['expense'],
};

export const accountFormSchema = z
    .object({
        account_code: z.string().min(1, 'Account code is required.').max(20, 'Account code cannot exceed 20 characters.'),
        account_name: z.string().min(1, 'Account name is required.').max(255),
        account_type: accountTypeSchema,
        account_subtype: accountSubtypeSchema,
        parent_id: z.number().nullable(),
        is_header: z.boolean(),
        is_active: z.boolean(),
        description: z.string().max(65535).nullable().optional(),
    })
    .superRefine((data, ctx) => {
        const allowedSubtypes = subtypeByType[data.account_type];

        if (!allowedSubtypes.includes(data.account_subtype)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Account subtype must match the selected account type.',
                path: ['account_subtype'],
            });
        }
    });

export type AccountFormValues = z.infer<typeof accountFormSchema>;

export function defaultSubtypeForType(type: z.infer<typeof accountTypeSchema>): z.infer<typeof accountSubtypeSchema> {
    return subtypeByType[type][0];
}

export function subtypesForType(type: z.infer<typeof accountTypeSchema>): z.infer<typeof accountSubtypeSchema>[] {
    return subtypeByType[type];
}
