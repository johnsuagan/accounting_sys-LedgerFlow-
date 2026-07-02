import { LandingSection } from '@/components/landing/section';
import { StaggerItem } from '@/components/landing/animate';
import {
    BarChart3,
    BookOpen,
    FileSpreadsheet,
    FlaskConical,
    GraduationCap,
    Layers,
    Lock,
    Monitor,
    Shield,
    Sparkles,
    Workflow,
} from 'lucide-react';

const trustItems = [
    { icon: GraduationCap, label: 'Designed for Accounting Education' },
    { icon: Workflow, label: 'Professional Accounting Workflow' },
    { icon: FileSpreadsheet, label: 'Financial Statement Automation' },
    { icon: Layers, label: 'Business Process Mapping' },
    { icon: BarChart3, label: 'Financial Analysis' },
    { icon: Shield, label: 'Audit Trail' },
    { icon: Monitor, label: 'Responsive' },
    { icon: Lock, label: 'Secure' },
];

export function LandingTrust() {
    return (
        <LandingSection className="border-y border-[#BFDBFE] bg-[#EFF6FF]/50 py-8 sm:py-10">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {trustItems.map(({ icon: Icon, label }, index) => (
                    <StaggerItem key={label} index={index}>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#475569]">
                        <Icon className="size-4 text-[#16A34A]" />
                        {label}
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}

export function LandingAudience() {
    const audiences = [
        { icon: GraduationCap, title: 'Accounting Students', desc: 'Master the full accounting cycle hands-on' },
        { icon: BookOpen, title: 'Accounting Instructors', desc: 'Assign exercises and review student work' },
        { icon: Sparkles, title: 'Business Students', desc: 'Understand financial reporting fundamentals' },
        { icon: Layers, title: 'Educational Institutions', desc: 'Deploy across accounting programs' },
        { icon: FlaskConical, title: 'Universities', desc: 'Support laboratory-based accounting courses' },
    ];

    return (
        <LandingSection className="lf-section-alt py-16 sm:py-24 lg:py-28">
            <div className="mb-12 text-center">
                <p className="lf-eyebrow mb-3">Built For</p>
                <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">Ideal Users</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-[#64748B]">
                    LedgerFlow serves the entire accounting education ecosystem — not generic business software users.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {audiences.map(({ icon: Icon, title, desc }, index) => (
                    <StaggerItem key={title} index={index}>
                        <div className="lf-card h-full p-6 transition-transform duration-200 hover:-translate-y-1">
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                            <Icon className="size-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{desc}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}
