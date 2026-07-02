import { RatioCenterPage } from '@/pages/financial-analysis/ratio-center';
import type { FinancialAnalysisPageProps, FinancialRatio } from '@/types/financial-analysis';

interface EfficiencyPageProps extends FinancialAnalysisPageProps {
    ratios: FinancialRatio[];
}

export default function EfficiencyRatios(props: EfficiencyPageProps) {
    return (
        <RatioCenterPage
            {...props}
            title="Efficiency Ratios"
            routeName="financial-analysis.efficiency"
            navRoute="financial-analysis.efficiency"
        />
    );
}
