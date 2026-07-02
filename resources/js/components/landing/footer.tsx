import AppLogoIcon from '@/components/app-logo-icon';
import { FadeIn } from '@/components/landing/animate';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Github } from 'lucide-react';

interface LandingFooterProps {
    isAuthenticated: boolean;
}

const footerLinks = {
    Product: [
        { label: 'Features', href: '#features' },
        { label: 'Workflow', href: '#workflow' },
        { label: 'Financial Analysis', href: '#analysis' },
        { label: 'Practice Sets', href: '#practice-sets' },
    ],
    Resources: [
        { label: 'Documentation', href: '#' },
        { label: 'GitHub', href: '#' },
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
    ],
};

export function LandingFooter({ isAuthenticated }: LandingFooterProps) {
    return (
        <footer className="border-t border-[#BFDBFE] bg-gradient-to-b from-[#EFF6FF] to-[#F8FAFC]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563EB]">
                                <AppLogoIcon className="size-5 fill-white" />
                            </div>
                            <span className="text-lg font-bold text-[#0F172A]">LedgerFlow</span>
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#64748B]">
                            Professional accounting information system for accounting education. Complete the full
                            accounting cycle from journal entries to financial analysis.
                        </p>
                        <div className="mt-6">
                            <Button asChild className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]">
                                <Link href={isAuthenticated ? route('dashboard') : route('register')}>
                                    Get Started Free
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <h4 className="text-sm font-semibold text-[#0F172A]">{group}</h4>
                            <ul className="mt-4 space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E2E8F0] pt-8 sm:flex-row">
                    <p className="text-sm text-[#64748B]">© {new Date().getFullYear()} LedgerFlow. All rights reserved.</p>
                    <a
                        href="#"
                        className="flex items-center gap-2 text-sm text-[#64748B] transition-colors hover:text-[#0F172A]"
                        aria-label="GitHub"
                    >
                        <Github className="size-4" />
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}

export function LandingCta({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <section className="lf-section-blue border-t border-[#BFDBFE] py-16 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                <FadeIn>
                    <div className="lf-card mx-auto max-w-2xl border-[#BFDBFE] bg-gradient-to-b from-white to-[#EFF6FF]/50 p-8 transition-transform duration-300 hover:scale-[1.01] sm:p-10">
                    <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                        Start your accounting journey today
                    </h2>
                    <p className="mt-4 text-lg text-[#64748B]">
                        Join students mastering the complete accounting cycle with LedgerFlow.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="h-12 min-w-[160px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8]">
                            <Link href={isAuthenticated ? route('dashboard') : route('register')}>Get Started</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-12 min-w-[160px] rounded-lg border-[#E2E8F0] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#0F172A]"
                        >
                            <Link href={route('login')}>Log in</Link>
                        </Button>
                    </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
