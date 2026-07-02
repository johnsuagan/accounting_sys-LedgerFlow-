import { AccountForm } from '@/components/accounting/account-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { AccountEnums, ParentOption } from '@/types/accounting';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface CreateAccountProps {
    parentOptions: ParentOption[];
    enums: AccountEnums;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chart of Accounts', href: route('accounting.accounts.index') },
    { title: 'New account', href: route('accounting.accounts.create') },
];

export default function CreateAccount({ parentOptions }: CreateAccountProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New account" />

            <div className="mx-auto max-w-4xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AccountForm mode="create" parentOptions={parentOptions} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
