import { PageMockup } from '@/components/landing/mockups';
import { StaggerItem } from '@/components/landing/animate';
import { LandingSection, SectionHeader } from '@/components/landing/section';

const screenshots: { variant: Parameters<typeof PageMockup>[0]['variant']; label: string }[] = [
    { variant: 'dashboard', label: 'Dashboard' },
    { variant: 'journal', label: 'Journal Entries' },
    { variant: 'ledger', label: 'General Ledger' },
    { variant: 'taccount', label: 'T-Accounts' },
    { variant: 'trial', label: 'Trial Balance' },
    { variant: 'statements', label: 'Financial Statements' },
    { variant: 'ratios', label: 'Financial Ratios' },
];

export function LandingScreenshots() {
    return (
        <LandingSection className="lf-section-alt py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Application Preview"
                title="Software that looks and feels professional"
                description="Every screen is designed for clarity — the same interface students will encounter in professional accounting practice."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {screenshots.map(({ variant, label }, index) => (
                    <StaggerItem key={label} index={index}>
                        <div className="group">
                            <PageMockup variant={variant} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]" />
                            <p className="mt-3 text-center text-sm font-medium text-[#475569]">{label}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}

const technologies = [
    { name: 'Laravel', desc: 'Robust PHP framework' },
    { name: 'React', desc: 'Modern UI library' },
    { name: 'TypeScript', desc: 'Type-safe development' },
    { name: 'Inertia.js', desc: 'Seamless SPA experience' },
    { name: 'MySQL', desc: 'Reliable data storage' },
    { name: 'Responsive', desc: 'Works on every device' },
];

export function LandingTechnology() {
    return (
        <LandingSection id="technology" className="lf-section-white py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Technology"
                title="Modern architecture, built to last"
                description="A production-grade stack chosen for performance, maintainability, and educational deployment at scale."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {technologies.map((tech, index) => (
                    <StaggerItem key={tech.name} index={index}>
                        <div className="lf-card flex items-center gap-4 p-5 transition-transform duration-200 hover:-translate-y-1">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-xs font-bold text-[#475569]">
                            {tech.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-[#0F172A]">{tech.name}</p>
                            <p className="text-sm text-[#64748B]">{tech.desc}</p>
                        </div>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}
