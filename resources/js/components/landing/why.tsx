import { StaggerItem } from '@/components/landing/animate';
import { DashboardPreviewMockup } from '@/components/landing/mockups';
import { LandingSection, SectionHeader } from '@/components/landing/section';

export function LandingDashboardPreview() {
    return (
        <LandingSection id="demo" className="lf-section-blue py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Live Preview"
                title="A dashboard built for accounting professionals"
                description="Real-time KPIs, financial trends, business health scores, and journal entry activity — all computed automatically from posted transactions."
            />
            <StaggerItem index={0}>
                <DashboardPreviewMockup className="lf-float transition-transform duration-300 hover:scale-[1.01]" />
            </StaggerItem>
        </LandingSection>
    );
}

const advantages = [
    'Professional Accounting Workflow',
    'Automatic Financial Statements',
    'Financial Ratio Analysis',
    'Business Health Monitoring',
    'Educational Practice Sets',
    'Accounting Laboratory Support',
    'Modern Dashboard',
    'Responsive Design',
    'PDF & Excel Reports',
    'Professional User Experience',
];

export function LandingWhy() {
    return (
        <LandingSection className="lf-section-alt py-16 sm:py-24 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                    <p className="lf-eyebrow mb-3">Why LedgerFlow</p>
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                        Built for how accounting is actually taught
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-[#64748B]">
                        LedgerFlow bridges the gap between textbook theory and professional practice. Students work
                        through the same workflow used by accountants — without the complexity of enterprise ERP
                        systems.
                    </p>
                    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                        {advantages.map((item, index) => (
                            <StaggerItem key={item} as="li" index={index} className="flex items-start gap-2.5 text-sm text-[#475569]">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#16A34A]" />
                                {item}
                            </StaggerItem>
                        ))}
                    </ul>
                </div>
                <div className="lf-card p-8">
                    <div className="space-y-6">
                        {[
                            { stat: '11+', label: 'Core accounting modules' },
                            { stat: '100%', label: 'Auto-generated reports' },
                            { stat: '0', label: 'Manual ledger encoding' },
                            { stat: '∞', label: 'Account traceability' },
                        ].map(({ stat, label }, index) => (
                            <StaggerItem key={label} index={index}>
                                <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-6 last:border-0 last:pb-0">
                                <span className="text-3xl font-bold text-[#2563EB]">{stat}</span>
                                <span className="text-sm font-medium text-[#64748B]">{label}</span>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>
                </div>
            </div>
        </LandingSection>
    );
}
