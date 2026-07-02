import { RatioCenterPage } from '@/pages/financial-analysis/ratio-center';
import type { FinancialAnalysisPageProps, FinancialRatio } from '@/types/financial-analysis';

interface ProfitabilityPageProps extends FinancialAnalysisPageProps {
    ratios: FinancialRatio[];
}

export default function ProfitabilityRatios(props: ProfitabilityPageProps) {
    return (
        <RatioCenterPage
            {...props}
            title="Profitability Ratios"
            routeName="financial-analysis.profitability"
            navRoute="financial-analysis.profitability"
        />
    );
}
