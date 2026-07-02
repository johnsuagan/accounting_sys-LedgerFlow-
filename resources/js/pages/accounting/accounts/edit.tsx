import { AccountDeactivateDialog } from '@/components/accounting/account-deactivate-dialog';
import { AccountForm } from '@/components/accounting/account-form';
import { AccountTypeBadge } from '@/components/accounting/account-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Account, AccountEnums, ParentOption } from '@/types/accounting';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface EditAccountProps {
    account: Account;
    parentOptions: ParentOption[];
    enums: AccountEnums;
    can: {
        delete: boolean;
        deactivate: boolean;
        activate: boolean;
        write: boolean;
    };
}

export default function EditAccount({ account, parentOptions, can }: EditAccountProps) {
    const { flash, company } = usePage<SharedData>().props;
    const readOnly = !can.write || company?.current?.role === 'auditor';
    const [showDeactivate, setShowDeactivate] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chart of Accounts', href: route('accounting.accounts.index') },
        { title: account.account_code, href: route('accounting.accounts.edit', account.id) },
    ];

    const handleDelete = () => {
        if (!confirm('Delete this account? This cannot be undone.')) {
            return;
        }

        router.delete(route('accounting.accounts.destroy', account.id));
    };

    const handleActivate = () => {
        router.patch(route('accounting.accounts.activate', account.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_code}`} />

            <div className="mx-auto max-w-4xl space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="space-y-2">
                            <CardTitle>
                                {account.account_code} — {account.account_name}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <AccountTypeBadge type={account.account_type} />
                                {account.is_header && <Badge variant="outline">Header</Badge>}
                                {account.is_system && <Badge variant="secondary">System</Badge>}
                                <Badge variant={account.is_active ? 'default' : 'secondary'}>
                                    {account.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {account.has_posted_activity && <Badge variant="outline">Has posted activity</Badge>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AccountForm
                            mode="edit"
                            account={account}
                            parentOptions={parentOptions}
                            readOnly={readOnly}
                        />

                        {!readOnly && (
                            <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
                                {can.deactivate && account.is_active && !account.is_system && (
                                    <Button type="button" variant="outline" onClick={() => setShowDeactivate(true)}>
                                        Deactivate account
                                    </Button>
                                )}
                                {can.activate && !account.is_active && !account.is_system && (
                                    <Button type="button" variant="outline" onClick={handleActivate}>
                                        Activate account
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button type="button" variant="destructive" onClick={handleDelete}>
                                        Delete account
                                    </Button>
                                )}
                                {account.has_posted_activity && (
                                    <p className="text-muted-foreground w-full text-sm">
                                        Accounts with posted journal activity cannot be deleted. Deactivate instead to
                                        prevent new postings.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AccountDeactivateDialog account={account} open={showDeactivate} onOpenChange={setShowDeactivate} />
        </AppLayout>
    );
}
