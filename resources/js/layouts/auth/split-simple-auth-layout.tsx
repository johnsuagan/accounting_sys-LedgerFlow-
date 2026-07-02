import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface SplitSimpleAuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    formMaxWidth?: string;
}

export default function SplitSimpleAuthLayout({
    children,
    title = 'Sign in',
    description,
    formMaxWidth = '400px',
}: SplitSimpleAuthLayoutProps) {
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="auth-split-simple min-h-svh font-[family-name:var(--font-landing)] antialiased lg:grid lg:grid-cols-2">
            {/* Left — MIS project panel (desktop) */}
            <div className="auth-mis-panel relative hidden flex-col justify-center overflow-hidden px-10 xl:px-16 lg:flex">
                <div className="auth-mis-glow" aria-hidden="true" />
                <div className="relative z-10 max-w-md">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#2563EB] shadow-sm">
                            <AppLogoIcon className="size-6 fill-white" />
                        </div>
                        <span className="text-xl font-bold text-[#0F172A]">LedgerFlow</span>
                    </div>

                    <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
                        Masters in Information System
                    </p>

                    <h2 className="mt-4 text-2xl font-bold leading-snug text-[#0F172A] xl:text-3xl">
                        A project of the MIS program
                    </h2>

                    <p className="mt-4 text-base leading-relaxed text-[#475569]">
                        LedgerFlow — a professional accounting information system built for accounting education.
                    </p>
                </div>
            </div>

            {/* Mobile — compact MIS banner */}
            <div className="auth-mis-panel-mobile border-b border-[#E2E8F0] px-4 py-5 text-center lg:hidden">
                <Link href={route('home')} className="inline-flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563EB]">
                        <AppLogoIcon className="size-5 fill-white" />
                    </div>
                    <span className="font-bold text-[#0F172A]">LedgerFlow</span>
                </Link>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
                    Masters in Information System
                </p>
            </div>

            {/* Right — auth form */}
            <div className="flex flex-col justify-center overflow-y-auto bg-white px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
                <div className="mx-auto w-full" style={{ maxWidth: formMaxWidth }}>
                    <div className="mb-8 hidden lg:block">
                        <Link
                            href={route('home')}
                            className="text-sm text-[#64748B] transition-colors hover:text-[#2563EB]"
                        >
                            ← Back to home
                        </Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-[#0F172A]">{title}</h1>
                        {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
