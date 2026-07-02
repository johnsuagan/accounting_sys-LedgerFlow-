import { RatioCenterPage } from '@/pages/financial-analysis/ratio-center';
import type { FinancialAnalysisPageProps, FinancialRatio } from '@/types/financial-analysis';

interface SolvencyPageProps extends FinancialAnalysisPageProps {
    ratios: FinancialRatio[];
}

export default function SolvencyRatios(props: SolvencyPageProps) {
    return (
        <RatioCenterPage
            {...props}
            title="Solvency Ratios"
            routeName="financial-analysis.solvency"
            navRoute="financial-analysis.solvency"
        />
    );
}
