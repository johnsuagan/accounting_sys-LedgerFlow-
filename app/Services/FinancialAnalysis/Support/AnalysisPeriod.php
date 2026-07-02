<?php

namespace App\Services\FinancialAnalysis\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;

final class AnalysisPeriod
{
    public function __construct(
        public readonly CarbonInterface $currentEnd,
        public readonly CarbonInterface $currentStart,
        public readonly ?CarbonInterface $previousEnd,
        public readonly ?CarbonInterface $previousStart,
        public readonly string $comparisonType,
        public readonly string $label,
    ) {}

    public static function resolve(CarbonInterface $asOfDate, string $comparisonType = 'year'): self
    {
        $asOf = Carbon::parse($asOfDate);

        return match ($comparisonType) {
            'month' => self::forMonth($asOf),
            'quarter' => self::forQuarter($asOf),
            default => self::forYear($asOf),
        };
    }

    public static function forMonth(CarbonInterface $asOf): self
    {
        $currentStart = $asOf->copy()->startOfMonth();
        $currentEnd = $asOf->copy()->endOfMonth();
        $previousEnd = $currentStart->copy()->subDay();
        $previousStart = $previousEnd->copy()->startOfMonth();

        return new self(
            currentEnd: $currentEnd,
            currentStart: $currentStart,
            previousEnd: $previousEnd,
            previousStart: $previousStart,
            comparisonType: 'month',
            label: $asOf->format('F Y'),
        );
    }

    public static function forQuarter(CarbonInterface $asOf): self
    {
        $currentStart = $asOf->copy()->firstOfQuarter();
        $currentEnd = $asOf->copy()->lastOfQuarter();
        $previousEnd = $currentStart->copy()->subDay();
        $previousStart = $previousEnd->copy()->firstOfQuarter();

        return new self(
            currentEnd: $currentEnd,
            currentStart: $currentStart,
            previousEnd: $previousEnd,
            previousStart: $previousStart,
            comparisonType: 'quarter',
            label: 'Q'.$asOf->quarter.' '.$asOf->year,
        );
    }

    public static function forYear(CarbonInterface $asOf): self
    {
        $currentStart = $asOf->copy()->startOfYear();
        $currentEnd = $asOf->copy()->endOfYear();
        $previousEnd = $currentStart->copy()->subDay();
        $previousStart = $previousEnd->copy()->startOfYear();

        return new self(
            currentEnd: $currentEnd,
            currentStart: $currentStart,
            previousEnd: $previousEnd,
            previousStart: $previousStart,
            comparisonType: 'year',
            label: (string) $asOf->year,
        );
    }

    /**
     * @return array<string, string>
     */
    public function toFilterArray(): array
    {
        return [
            'as_of_date' => $this->currentEnd->toDateString(),
            'comparison_type' => $this->comparisonType,
            'period_label' => $this->label,
        ];
    }
}
