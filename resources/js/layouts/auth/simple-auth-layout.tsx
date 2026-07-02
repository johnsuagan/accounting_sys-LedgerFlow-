import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface SimpleAuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function SimpleAuthLayout({ children, title = 'Sign in', description }: SimpleAuthLayoutProps) {
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-[#F8FAFC] px-4 py-10 font-[family-name:var(--font-landing)] antialiased">
            <div className="w-full max-w-[400px]">
                <Link href={route('home')} className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#2563EB] shadow-sm">
                        <AppLogoIcon className="size-6 fill-white" />
                    </div>
                    <span className="text-lg font-bold text-[#0F172A]">LedgerFlow</span>
                </Link>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-semibold text-[#0F172A]">{title}</h1>
                        {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
