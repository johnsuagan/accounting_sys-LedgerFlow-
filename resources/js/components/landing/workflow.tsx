import { LandingSection, SectionHeader } from '@/components/landing/section';
import { StaggerItem } from '@/components/landing/animate';
import {
    BarChart3,
    BookText,
    FileSpreadsheet,
    ListTree,
    Scale,
    ScrollText,
    SplitSquareHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const steps: { icon: LucideIcon; title: string; description: string }[] = [
    { icon: ListTree, title: 'Chart of Accounts', description: 'Define the account structure' },
    { icon: BookText, title: 'Journal Entries', description: 'Record business transactions' },
    { icon: SplitSquareHorizontal, title: 'T-Accounts', description: 'Visualize DR and CR activity' },
    { icon: ScrollText, title: 'General Ledger', description: 'Track running balances' },
    { icon: Scale, title: 'Trial Balance', description: 'Verify DR equals CR' },
    { icon: FileSpreadsheet, title: 'Financial Statements', description: 'Generate formal reports' },
    { icon: BarChart3, title: 'Financial Analysis', description: 'Analyze business performance' },
];

export function LandingWorkflow() {
    return (
        <LandingSection id="workflow" className="lf-section-alt py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Accounting Cycle"
                title="The complete professional workflow"
                description="Every step flows automatically from journal entries. No manual report encoding — ever."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-7">
                {steps.map(({ icon: Icon, title, description }, index) => (
                    <StaggerItem key={title} index={index}>
                        <div className="group relative text-center">
                        <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#DBEAFE] group-hover:shadow-md">
                            <Icon className="size-6 text-[#2563EB]" />
                            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#16A34A] text-[10px] font-bold text-white">
                                {index + 1}
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
                        <p className="mt-1 text-xs text-[#64748B]">{description}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}
