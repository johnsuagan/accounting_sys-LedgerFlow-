import { AccountFiltersBar } from '@/components/accounting/account-filters';
import { AccountTree } from '@/components/accounting/account-tree';
import { AccountsTable } from '@/components/accounting/accounts-table';
import { AccountingWorkflow } from '@/components/accounting/accounting-workflow';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import type { Account, AccountEnums, AccountFilters, AccountTreeNode, SharedData } from '@/types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ListTree, Plus } from 'lucide-react';
import { useState } from 'react';

interface AccountsIndexProps {
    accountsTree: AccountTreeNode[];
    accounts: Account[];
    filters: AccountFilters;
    enums: AccountEnums;
    can: {
        create: boolean;
        write: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chart of Accounts', href: route('accounting.accounts.index') },
];

export default function AccountsIndex({ accountsTree, accounts, filters, enums, can }: AccountsIndexProps) {
    const { flash, company } = usePage<SharedData>().props;
    const readOnly = !can.write || company?.current?.role === 'auditor';
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <AccountingWorkflow currentStep={1} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Chart of Accounts</h1>
                        <p className="text-muted-foreground text-sm">
                            Hierarchical account structure for {company?.current?.name ?? 'your company'}
                        </p>
                    </div>
                    {!readOnly && can.create && (
                        <Button asChild>
                            <Link href={route('accounting.accounts.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                New account
                            </Link>
                        </Button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {readOnly && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                        You have read-only access. Account changes are disabled for auditors.
                    </div>
                )}

                <AccountFiltersBar filters={filters} accountTypes={enums.accountTypes} />

                <div className="grid flex-1 gap-4 lg:grid-cols-5">
                    <div className="hidden lg:col-span-2 lg:block">
                        <AccountTree nodes={accountsTree} selectedId={selectedId} onSelect={setSelectedId} readOnly={readOnly} />
                    </div>

                    <div className="lg:col-span-3">
                        <div className="mb-3 flex items-center justify-between lg:hidden">
                            <h2 className="text-lg font-medium">Accounts</h2>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <ListTree className="mr-2 h-4 w-4" />
                                        Tree view
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[90vw] sm:max-w-md">
                                    <SheetHeader>
                                        <SheetTitle>Account hierarchy</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <AccountTree
                                            nodes={accountsTree}
                                            selectedId={selectedId}
                                            onSelect={setSelectedId}
                                            readOnly={readOnly}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <AccountsTable accounts={accounts} selectedId={selectedId} onSelect={setSelectedId} readOnly={readOnly} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
