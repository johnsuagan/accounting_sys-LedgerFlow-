<?php

namespace App\Services\FinancialAnalysis;

use App\Services\FinancialAnalysis\Support\AnalysisPeriod;
use App\Services\FinancialAnalysis\Support\FinancialRatioResult;

class BusinessHealthScoreService
{
    public function __construct(
        protected FinancialRatioService $financialRatioService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function score(int $companyId, AnalysisPeriod $period, ?int $fiscalYearId = null): array
    {
        $profitability = $this->categoryFromRatios($this->financialRatioService->profitability($companyId, $period, $fiscalYearId));
        $liquidity = $this->categoryFromRatios($this->financialRatioService->liquidity($companyId, $period, $fiscalYearId));
        $solvency = $this->categoryFromRatios($this->financialRatioService->solvency($companyId, $period, $fiscalYearId));
        $efficiency = $this->categoryFromRatios(
            array_values(array_filter(
                $this->financialRatioService->efficiency($companyId, $period, $fiscalYearId),
                fn (FinancialRatioResult $ratio) => ! $ratio->isFuture,
            )),
        );

        $categories = [
            'profitability' => $profitability,
            'liquidity' => $liquidity,
            'solvency' => $solvency,
            'efficiency' => $efficiency,
        ];

        $overall = $this->overallFromCategories($categories);

        return [
            'categories' => $categories,
            'overall' => $overall,
        ];
    }

    /**
     * @param  list<FinancialRatioResult>  $ratios
     * @return array{label: string, color: string, score: int}
     */
    protected function categoryFromRatios(array $ratios): array
    {
        if ($ratios === []) {
            return ['label' => 'Not Available', 'color' => 'gray', 'score' => 0];
        }

        $scores = [];

        foreach ($ratios as $ratio) {
            $scores[] = match ($ratio->statusColor) {
                'green' => 4,
                'yellow' => 3,
                'orange' => 2,
                'red' => 1,
                default => 0,
            };
        }

        $average = array_sum($scores) / count($scores);

        return match (true) {
            $average >= 3.5 => ['label' => 'Excellent', 'color' => 'green', 'score' => (int) round($average)],
            $average >= 2.5 => ['label' => 'Good', 'color' => 'green', 'score' => (int) round($average)],
            $average >= 1.5 => ['label' => 'Fair', 'color' => 'yellow', 'score' => (int) round($average)],
            default => ['label' => 'Needs Improvement', 'color' => 'red', 'score' => (int) round($average)],
        };
    }

    /**
     * @param  array<string, array{label: string, color: string, score: int}>  $categories
     * @return array{label: string, color: string}
     */
    protected function overallFromCategories(array $categories): array
    {
        $valid = array_values(array_filter($categories, fn (array $category) => $category['score'] > 0));

        if ($valid === []) {
            return ['label' => 'Not Available', 'color' => 'gray'];
        }

        $average = array_sum(array_column($valid, 'score')) / count($valid);

        return match (true) {
            $average >= 3.5 => ['label' => 'Excellent', 'color' => 'green'],
            $average >= 2.5 => ['label' => 'Good', 'color' => 'green'],
            $average >= 1.5 => ['label' => 'Fair', 'color' => 'yellow'],
            default => ['label' => 'Needs Improvement', 'color' => 'red'],
        };
    }
}
