import { HeroDashboardMockup } from '@/components/landing/mockups';
import { MountFade } from '@/components/landing/animate';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Play } from 'lucide-react';

interface LandingHeroProps {
    isAuthenticated: boolean;
}

export function LandingHero({ isAuthenticated }: LandingHeroProps) {
    return (
        <section className="lf-hero-bg relative pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28">
            <div className="lf-hero-glow" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <MountFade delay={0}>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#1D4ED8] shadow-sm backdrop-blur-sm">
                            <span className="size-2 animate-pulse rounded-full bg-[#16A34A]" />
                            Professional Accounting Information System for Education
                        </div>
                    </MountFade>

                    <MountFade delay={100}>
                        <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl xl:text-7xl">
                            LedgerFlow
                        </h1>
                    </MountFade>

                    <MountFade delay={200}>
                        <p className="mx-auto mt-4 max-w-3xl text-base font-medium text-[#475569] sm:text-lg lg:text-xl">
                            Business Process Mapping and Analysis of Financial Statement Preparation and Reporting
                        </p>
                    </MountFade>

                    <MountFade delay={300}>
                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base lg:text-lg">
                            A professional accounting information system that enables accounting students to complete the
                            entire accounting cycle — from journal entries to financial analysis — using a modern and
                            intuitive platform.
                        </p>
                    </MountFade>

                    <MountFade delay={400}>
                        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 w-full rounded-lg bg-[#2563EB] px-8 text-base shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] hover:bg-[#1D4ED8] sm:w-auto sm:min-w-[160px]"
                            >
                                <Link href={isAuthenticated ? route('dashboard') : route('register')}>
                                    Get Started
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 w-full rounded-lg border-[#BFDBFE] bg-white/90 px-8 text-base text-[#2563EB] shadow-sm transition-transform hover:scale-[1.02] hover:border-[#93C5FD] hover:bg-[#EFF6FF] sm:w-auto sm:min-w-[160px]"
                            >
                                <a href="#demo">
                                    <Play className="mr-2 size-4" />
                                    View Demo
                                </a>
                            </Button>
                        </div>
                    </MountFade>
                </div>

                <MountFade delay={550} className="relative mx-auto mt-12 w-full max-w-5xl sm:mt-16">
                    <div className="absolute -inset-3 rounded-2xl bg-[#2563EB]/5 blur-xl sm:-inset-4" aria-hidden="true" />
                    <HeroDashboardMockup className="lf-float relative w-full" />
                </MountFade>
            </div>
        </section>
    );
}
