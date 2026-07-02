import { LandingSection, SectionHeader } from '@/components/landing/section';
import { StaggerItem } from '@/components/landing/animate';
import {
    Activity,
    BarChart3,
    BookText,
    FileSpreadsheet,
    FlaskConical,
    Gauge,
    History,
    ListTree,
    Scale,
    ScrollText,
    SplitSquareHorizontal,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const features: { icon: LucideIcon; title: string; description: string }[] = [
    { icon: ListTree, title: 'Chart of Accounts', description: 'Design and maintain a professional account structure with hierarchical grouping.' },
    { icon: BookText, title: 'Journal Entries', description: 'Record double-entry transactions with draft, post, reverse, and attachment support.' },
    { icon: SplitSquareHorizontal, title: 'T-Accounts', description: 'Visualize debits and credits with running balances for every account.' },
    { icon: ScrollText, title: 'General Ledger', description: 'Chronological transaction history with opening balances and account summaries.' },
    { icon: Scale, title: 'Trial Balance', description: 'Verify that total debits equal total credits across all accounts.' },
    { icon: FileSpreadsheet, title: 'Financial Statements', description: 'Auto-generate SOFP, Income Statement, and Statement of Changes in Equity.' },
    { icon: TrendingUp, title: 'Financial Ratios', description: 'Profitability, liquidity, solvency, and efficiency ratios with benchmarks.' },
    { icon: Gauge, title: 'Business Health Dashboard', description: 'Overall financial health score across four key performance categories.' },
    { icon: BarChart3, title: 'Financial Analytics', description: 'Trend analysis, KPI comparisons, and period-over-period insights.' },
    { icon: FlaskConical, title: 'Practice Sets', description: 'Real business scenarios — laundry shops, restaurants, clinics, and more.' },
    { icon: Activity, title: 'Laboratory Activities', description: 'Structured accounting lab exercises with result comparison.' },
    { icon: History, title: 'Audit Trail', description: 'Complete journal entry change history for accountability and review.' },
];

export function LandingFeatures() {
    return (
        <LandingSection id="features" className="lf-section-white py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Platform"
                title="Everything you need for the accounting cycle"
                description="From chart of accounts to financial analysis — every module is designed for accounting education, not ERP complexity."
            />
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {features.map(({ icon: Icon, title, description }, index) => (
                    <StaggerItem key={title} index={index}>
                        <div className="lf-card h-full p-6 transition-transform duration-200 hover:-translate-y-1">
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                            <Icon className="size-5" />
                        </div>
                        <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{description}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}
