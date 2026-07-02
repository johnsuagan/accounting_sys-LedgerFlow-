import { RatioCenterPage } from '@/pages/financial-analysis/ratio-center';
import type { FinancialAnalysisPageProps, FinancialRatio } from '@/types/financial-analysis';

interface LiquidityPageProps extends FinancialAnalysisPageProps {
    ratios: FinancialRatio[];
}

export default function LiquidityRatios(props: LiquidityPageProps) {
    return (
        <RatioCenterPage
            {...props}
            title="Liquidity Ratios"
            routeName="financial-analysis.liquidity"
            navRoute="financial-analysis.liquidity"
        />
    );
}
