import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { LandingAudience, LandingTrust } from '@/components/landing/trust';
import { LandingCta, LandingFooter } from '@/components/landing/footer';
import { LandingDashboardPreview } from '@/components/landing/why';
import { LandingFeatures } from '@/components/landing/features';
import { LandingFinancialAnalysis } from '@/components/landing/financial-analysis';
import { LandingHero } from '@/components/landing/hero';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingLaboratory, LandingPracticeSets } from '@/components/landing/practice-sets';
import { LandingScreenshots, LandingTechnology } from '@/components/landing/screenshots';
import { LandingWhy } from '@/components/landing/why';
import { LandingWorkflow } from '@/components/landing/workflow';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <>
            <Head title="LedgerFlow — Professional Accounting for Education">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
                <meta
                    name="description"
                    content="LedgerFlow is a professional accounting information system for accounting education. Complete the full accounting cycle from journal entries to financial analysis."
                />
            </Head>

            <div className="landing-page min-h-screen font-[family-name:var(--font-landing)] antialiased">
                <LandingNavbar isAuthenticated={isAuthenticated} />
                <main>
                    <LandingHero isAuthenticated={isAuthenticated} />
                    <LandingTrust />
                    <LandingFeatures />
                    <LandingWorkflow />
                    <LandingDashboardPreview />
                    <LandingWhy />
                    <LandingFinancialAnalysis />
                    <LandingPracticeSets />
                    <LandingLaboratory />
                    <LandingScreenshots />
                    <LandingAudience />
                    <LandingTechnology />
                    <LandingCta isAuthenticated={isAuthenticated} />
                </main>
                <LandingFooter isAuthenticated={isAuthenticated} />
            </div>
        </>
    );
}
