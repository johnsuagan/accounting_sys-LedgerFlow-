import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinancialRatio } from '@/types/financial-analysis';

const statusVariant: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    yellow: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    gray: 'bg-muted text-muted-foreground',
};

interface RatioCardProps {
    ratio: FinancialRatio;
}

export function RatioCard({ ratio }: RatioCardProps) {
    const badgeClass = statusVariant[ratio.status_color] ?? statusVariant.gray;

    return (
        <Card className={ratio.is_future ? 'opacity-75' : undefined}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">{ratio.name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">{ratio.formula}</CardDescription>
                    </div>
                    <Badge className={badgeClass} variant="outline">
                        {ratio.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Computation</p>
                    <p className="font-mono text-sm">{ratio.computation}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Result</p>
                    <p className="font-mono text-3xl font-bold">{ratio.display_value}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Interpretation</p>
                    <p className="text-sm">{ratio.interpretation}</p>
                </div>
            </CardContent>
        </Card>
    );
}
