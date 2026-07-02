import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { accountSubtypeLabels, accountTypeLabels, normalBalanceForType, normalBalanceLabels } from '@/lib/accounting-labels';
import { AccountFormValues, accountFormSchema, defaultSubtypeForType, subtypesForType } from '@/schemas/account.schema';
import type { Account, ParentOption } from '@/types/accounting';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface AccountFormProps {
    mode: 'create' | 'edit';
    account?: Account;
    parentOptions: ParentOption[];
    readOnly?: boolean;
    submitLabel?: string;
}

export function AccountForm({ mode, account, parentOptions, readOnly = false, submitLabel }: AccountFormProps) {
    const { errors: serverErrors } = usePage<{ errors: Record<string, string> }>().props;

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountFormSchema),
        defaultValues: {
            account_code: account?.account_code ?? '',
            account_name: account?.account_name ?? '',
            account_type: account?.account_type ?? 'asset',
            account_subtype: account?.account_subtype ?? 'current_asset',
            parent_id: account?.parent_id ?? null,
            is_header: account?.is_header ?? false,
            is_active: account?.is_active ?? true,
            description: account?.description ?? '',
        },
    });

    const accountType = form.watch('account_type');
    const isHeader = form.watch('is_header');
    const isSystem = account?.is_system ?? false;

    useEffect(() => {
        const allowed = subtypesForType(accountType);
        const currentSubtype = form.getValues('account_subtype');

        if (!allowed.includes(currentSubtype)) {
            form.setValue('account_subtype', defaultSubtypeForType(accountType));
        }
    }, [accountType, form]);

    const onSubmit = form.handleSubmit((data) => {
        const payload = {
            ...data,
            parent_id: data.parent_id,
            description: data.description || null,
        };

        if (mode === 'create') {
            router.post(route('accounting.accounts.store'), payload);
            return;
        }

        router.put(route('accounting.accounts.update', account!.id), payload);
    });

    const serverAccountError = serverErrors.account;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {serverAccountError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    {serverAccountError}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="account_code">Account code</Label>
                    <Input id="account_code" disabled={readOnly || isSystem} {...form.register('account_code')} />
                    <InputError message={form.formState.errors.account_code?.message || serverErrors.account_code} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="account_name">Account name</Label>
                    <Input id="account_name" disabled={readOnly} {...form.register('account_name')} />
                    <InputError message={form.formState.errors.account_name?.message || serverErrors.account_name} />
                </div>

                <div className="space-y-2">
                    <Label>Account type</Label>
                    <Controller
                        control={form.control}
                        name="account_type"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={readOnly || isSystem}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(accountTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <InputError message={form.formState.errors.account_type?.message || serverErrors.account_type} />
                </div>

                <div className="space-y-2">
                    <Label>Account subtype</Label>
                    <Controller
                        control={form.control}
                        name="account_subtype"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={readOnly || isSystem}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {subtypesForType(accountType).map((subtype) => (
                                        <SelectItem key={subtype} value={subtype}>
                                            {accountSubtypeLabels[subtype]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <InputError message={form.formState.errors.account_subtype?.message || serverErrors.account_subtype} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label>Parent account</Label>
                    <Controller
                        control={form.control}
                        name="parent_id"
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : 'none'}
                                onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                                disabled={readOnly || isSystem}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="No parent (top level)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No parent (top level)</SelectItem>
                                    {parentOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {'—'.repeat(Math.max(option.level - 1, 0))} {option.account_code} — {option.account_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <InputError message={form.formState.errors.parent_id?.message || serverErrors.parent_id} />
                </div>

                <div className="space-y-2">
                    <Label>Normal balance</Label>
                    <Input value={normalBalanceLabels[normalBalanceForType(accountType)]} disabled readOnly />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Controller
                            control={form.control}
                            name="is_header"
                            render={({ field }) => (
                                <Checkbox
                                    id="is_header"
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(checked === true)}
                                    disabled={readOnly || isSystem}
                                />
                            )}
                        />
                        <Label htmlFor="is_header">Header account (no journal postings)</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Controller
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <Checkbox
                                    id="is_active"
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(checked === true)}
                                    disabled={readOnly || isSystem}
                                />
                            )}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                </div>

                {isHeader && (
                    <p className="text-muted-foreground md:col-span-2 text-sm">
                        Header accounts group child accounts and cannot receive journal postings.
                    </p>
                )}

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" disabled={readOnly} {...form.register('description')} />
                    <InputError message={serverErrors.description} />
                </div>
            </div>

            {!readOnly && (
                <div className="flex gap-3">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {submitLabel ?? (mode === 'create' ? 'Create account' : 'Save changes')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                </div>
            )}
        </form>
    );
}
