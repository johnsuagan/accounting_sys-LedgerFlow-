import { LandingSection, SectionHeader } from '@/components/landing/section';
import { StaggerItem } from '@/components/landing/animate';
import {
    Coffee,
    Factory,
    Scissors,
    ShoppingBag,
    Stethoscope,
    Store,
    UtensilsCrossed,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const practiceSets: { icon: LucideIcon; name: string; type: string }[] = [
    { icon: Scissors, name: 'Laundry Shop', type: 'Service Business' },
    { icon: Wrench, name: 'Car Wash', type: 'Service Business' },
    { icon: UtensilsCrossed, name: 'Restaurant', type: 'Food & Beverage' },
    { icon: Stethoscope, name: 'Dental Clinic', type: 'Professional Service' },
    { icon: ShoppingBag, name: 'Retail Store', type: 'Merchandising' },
    { icon: Wrench, name: 'Repair Shop', type: 'Service Business' },
    { icon: Coffee, name: 'Coffee Shop', type: 'Food & Beverage' },
    { icon: Store, name: 'Boutique Shop', type: 'General Service' },
    { icon: Factory, name: 'Manufacturing', type: 'Production' },
    { icon: ShoppingBag, name: 'Merchandising', type: 'Trading' },
];

export function LandingPracticeSets() {
    return (
        <LandingSection id="practice-sets" className="lf-section-alt py-16 sm:py-24 lg:py-28">
            <SectionHeader
                eyebrow="Practice Sets"
                title="Learn accounting with real business scenarios"
                description="Each practice set includes a pre-built chart of accounts, fiscal year, and optional starter transactions — so students can focus on recording and analyzing."
            />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {practiceSets.map(({ icon: Icon, name, type }, index) => (
                    <StaggerItem key={name} index={index}>
                        <div className="lf-card p-5 text-center transition-transform duration-200 hover:-translate-y-1">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                            <Icon className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{name}</h3>
                        <p className="mt-1 text-xs text-[#64748B]">{type}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </LandingSection>
    );
}

export function LandingLaboratory() {
    const steps = [
        'Select a laboratory exercise',
        'Journalize transactions',
        'Generate T-Accounts automatically',
        'Generate General Ledger',
        'Generate Trial Balance',
        'Generate Financial Statements',
        'Compare results with expected outcomes',
    ];

    return (
        <LandingSection className="lf-section-white py-16 sm:py-24 lg:py-28">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <SectionHeader
                    align="left"
                    eyebrow="Laboratory Activities"
                    title="Accounting lab exercises, digitized"
                    description="Students perform the same laboratory activities used in educational institutions — with automatic report generation and result comparison."
                />
                <div className="lf-card p-6">
                    <ol className="space-y-4">
                        {steps.map((step, index) => (
                            <StaggerItem key={step} as="li" index={index} className="flex items-start gap-4">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white">
                                    {index + 1}
                                </span>
                                <span className="pt-1 text-sm font-medium text-[#475569]">{step}</span>
                            </StaggerItem>
                        ))}
                    </ol>
                </div>
            </div>
        </LandingSection>
    );
}
