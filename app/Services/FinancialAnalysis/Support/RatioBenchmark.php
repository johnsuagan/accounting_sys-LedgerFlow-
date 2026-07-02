<?php

namespace App\Services\FinancialAnalysis\Support;

final class RatioBenchmark
{
    /**
     * @return array{status: string, color: string}
     */
    public static function forHigherIsBetter(?float $value, float $excellent, float $good, float $fair): array
    {
        if ($value === null) {
            return ['status' => 'Not Available', 'color' => 'gray'];
        }

        if ($value >= $excellent) {
            return ['status' => 'Excellent', 'color' => 'green'];
        }

        if ($value >= $good) {
            return ['status' => 'Good', 'color' => 'green'];
        }

        if ($value >= $fair) {
            return ['status' => 'Fair', 'color' => 'yellow'];
        }

        return ['status' => 'Needs Improvement', 'color' => 'red'];
    }

    /**
     * @return array{status: string, color: string}
     */
    public static function forLowerIsBetter(?float $value, float $excellent, float $good, float $fair): array
    {
        if ($value === null) {
            return ['status' => 'Not Available', 'color' => 'gray'];
        }

        if ($value <= $excellent) {
            return ['status' => 'Excellent', 'color' => 'green'];
        }

        if ($value <= $good) {
            return ['status' => 'Good', 'color' => 'green'];
        }

        if ($value <= $fair) {
            return ['status' => 'Fair', 'color' => 'yellow'];
        }

        return ['status' => 'Needs Improvement', 'color' => 'red'];
    }

    /**
     * @return array{status: string, color: string}
     */
    public static function forCurrentRatio(?float $value): array
    {
        return self::forHigherIsBetter($value, 2.0, 1.5, 1.0);
    }

    /**
     * @return array{status: string, color: string}
     */
    public static function forQuickRatio(?float $value): array
    {
        return self::forHigherIsBetter($value, 1.5, 1.0, 0.8);
    }

    /**
     * @return array{status: string, color: string}
     */
    public static function forDebtRatio(?float $value): array
    {
        return self::forLowerIsBetter($value, 0.4, 0.6, 0.8);
    }
}
