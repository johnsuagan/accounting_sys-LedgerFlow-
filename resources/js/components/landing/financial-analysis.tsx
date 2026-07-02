import { LandingSection, SectionHeader } from '@/components/landing/section';
import { AnimatedBar, StaggerItem } from '@/components/landing/animate';
import { cn } from '@/lib/utils';

const ratios = [
    { name: 'ROA', value: '15.4%', status: 'Excellent', formula: 'Net Income ÷ Avg Assets' },
    { name: 'ROI', value: '21.8%', status: 'Excellent', formula: 'Net Income ÷ Avg Equity' },
    { name: 'ROE', value: '21.8%', status: 'Excellent', formula: 'Net Income ÷ Avg Equity' },
    { name: 'Current Ratio', value: '2.4×', status: 'Excellent', formula: 'Current Assets ÷ Current Liabilities' },
    { name: 'Debt Ratio', value: '32%', status: 'Good', formula: 'Liabilities ÷ Assets' },
    { name: 'Health Score', value: 'Good', status: 'Overall', formula: '4-category composite' },
];

const statusStyles: Record<string, string> = {
    Excellent: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]',
    Good: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]',
    Overall: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]',
};

export function LandingFinancialAnalysis() {
    return (
        <LandingSection id="analysis" className="lf-section-blue py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Financial Analysis"
                title="Understand business performance at a glance"
                description="Automatically computed ratios, benchmarks, trend analysis, and rule-based business insights — no AI, no guesswork."
            />
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    {ratios.map((ratio, index) => (
                        <StaggerItem key={ratio.name} index={index}>
                            <div className="lf-card h-full p-5 transition-transform duration-200 hover:-translate-y-1">
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-[#64748B]">{ratio.name}</p>
                                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', statusStyles[ratio.status])}>
                                        {ratio.status}
                                    </span>
                                </div>
                                <p className="mt-2 font-mono text-2xl font-bold text-[#0F172A]">{ratio.value}</p>
                                <p className="mt-1 text-xs text-[#64748B]">{ratio.formula}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </div>
                <StaggerItem index={3}>
                    <div className="lf-card h-full p-6">
                        <p className="mb-1 text-sm font-medium text-[#475569]">Revenue Trend — Monthly</p>
                        <p className="mb-6 text-xs text-[#64748B]">FY 2026 · Auto-computed from journal entries</p>
                        <div className="flex h-48 items-end gap-2">
                            {[35, 42, 38, 50, 48, 55, 52, 60, 58, 68, 72, 85].map((h, i) => (
                                <AnimatedBar key={i} height={h} index={i}>
                                    {i % 3 === 0 && (
                                        <span className="text-[8px] text-[#94A3B8]">
                                            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                        </span>
                                    )}
                                </AnimatedBar>
                            ))}
                        </div>
                        <div className="mt-6 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
                            <p className="text-sm font-medium text-[#16A34A]">Business Insight</p>
                            <p className="mt-1 text-sm text-[#475569]">
                                Revenue increased by 12% compared to the previous period. Net income improved due to
                                increased service revenue.
                            </p>
                        </div>
                    </div>
                </StaggerItem>
            </div>
        </LandingSection>
    );
}
