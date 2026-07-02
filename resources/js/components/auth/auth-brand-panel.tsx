import AppLogoIcon from '@/components/app-logo-icon';
import { HeroDashboardMockup } from '@/components/landing/mockups';
import { Check } from 'lucide-react';

const highlights = [
    'Journal Entries',
    'T-Accounts',
    'General Ledger',
    'Trial Balance',
    'Financial Statements',
    'Financial Ratios',
    'Business Analytics',
];

export function AuthBrandPanel() {
    return (
        <div className="auth-brand-panel relative hidden flex-col justify-between overflow-hidden p-8 lg:flex lg:p-12 xl:p-14">
            <div className="auth-brand-glow" aria-hidden="true" />

            <div className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#2563EB] shadow-md shadow-blue-500/20">
                        <AppLogoIcon className="size-6 fill-white" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tracking-tight text-[#0F172A]">LedgerFlow</p>
                        <p className="text-xs font-medium text-[#64748B]">MIS · Accounting Education</p>
                    </div>
                </div>

                <div className="mt-10 max-w-md">
                    <p className="text-sm font-medium leading-relaxed text-[#475569]">
                        Business Process Mapping and Analysis of Financial Statement Preparation and Reporting
                    </p>
                    <p className="mt-4 text-base font-semibold text-[#0F172A]">
                        Professional Accounting Information System for Accounting Education
                    </p>
                </div>

                <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
                    {highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-[#475569]">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
                                <Check className="size-3 text-[#16A34A]" strokeWidth={3} />
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative z-10 mt-10">
                <HeroDashboardMockup className="auth-preview-mockup w-full max-w-lg shadow-xl" />
            </div>
        </div>
    );
}

export function AuthBrandPanelMobile() {
    return (
        <div className="auth-brand-panel-mobile relative overflow-hidden px-4 py-8 lg:hidden">
            <div className="relative z-10 mx-auto max-w-md text-center">
                <div className="mb-4 flex items-center justify-center gap-2.5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]">
                        <AppLogoIcon className="size-5 fill-white" />
                    </div>
                    <span className="text-lg font-bold text-[#0F172A]">LedgerFlow</span>
                </div>
                <p className="text-sm text-[#64748B]">Professional Accounting Information System for Accounting Education</p>
            </div>
            <div className="relative z-10 mx-auto mt-6 max-w-sm">
                <HeroDashboardMockup className="auth-preview-mockup w-full shadow-lg" />
            </div>
        </div>
    );
}
