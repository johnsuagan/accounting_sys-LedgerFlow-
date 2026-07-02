import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface AuditLogEntry {
    id: number;
    module: string;
    action: string;
    auditable_type: string;
    auditable_id: number | null;
    user_name: string | null;
    created_at: string | null;
}

interface AuditTrailIndexProps {
    logs: Paginated<AuditLogEntry>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Audit Trail', href: route('accounting.audit-trail.index') },
];

export default function AuditTrailIndex({ logs }: AuditTrailIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Trail" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Audit Trail</h1>
                    <p className="text-muted-foreground text-sm">Journal entry activity log for your practice set</p>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">When</th>
                                <th className="px-4 py-3 text-left font-medium">User</th>
                                <th className="px-4 py-3 text-left font-medium">Action</th>
                                <th className="px-4 py-3 text-left font-medium">Record</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                        No audit events recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="border-b hover:bg-muted/40">
                                        <td className="px-4 py-3">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-3">{log.user_name ?? 'System'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{log.action}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.auditable_type === 'JournalEntry' && log.auditable_id ? (
                                                <Link
                                                    href={route('accounting.journal-entries.show', log.auditable_id)}
                                                    className="text-primary hover:underline"
                                                >
                                                    Journal Entry #{log.auditable_id}
                                                </Link>
                                            ) : (
                                                <span>
                                                    {log.auditable_type} {log.auditable_id ?? ''}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
