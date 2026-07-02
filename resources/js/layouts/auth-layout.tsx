import LedgerFlowAuthLayout from '@/layouts/auth/ledgerflow-auth-layout';

export default function AuthLayout({
    children,
    title,
    description,
    showBackHome = true,
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    showBackHome?: boolean;
}) {
    return (
        <LedgerFlowAuthLayout title={title} subtitle={description} showBackHome={showBackHome}>
            {children}
        </LedgerFlowAuthLayout>
    );
}
