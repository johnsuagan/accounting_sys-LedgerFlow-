import { AuthBrandPanel, AuthBrandPanelMobile } from '@/components/auth/auth-brand-panel';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface LedgerFlowAuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    showBackHome?: boolean;
}

export default function LedgerFlowAuthLayout({
    children,
    title,
    subtitle,
    showBackHome = true,
}: LedgerFlowAuthLayoutProps) {
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="auth-page min-h-svh font-[family-name:var(--font-landing)] antialiased">
            <div className="grid min-h-svh lg:grid-cols-2">
                <AuthBrandPanel />

                <div className="auth-form-panel flex flex-col">
                    <AuthBrandPanelMobile />

                    <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
                        <div className="mx-auto w-full max-w-md">
                            {showBackHome && (
                                <Link
                                    href={route('home')}
                                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#2563EB]"
                                >
                                    <ArrowLeft className="size-4" />
                                    Back to Home
                                </Link>
                            )}

                            <div className="mb-8 lg:hidden">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563EB]">
                                        <AppLogoIcon className="size-5 fill-white" />
                                    </div>
                                    <span className="font-bold text-[#0F172A]">LedgerFlow</span>
                                </div>
                            </div>

                            <header className="mb-8">
                                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">{title}</h1>
                                <p className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-base">{subtitle}</p>
                            </header>

                            <div className="auth-form-card">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
