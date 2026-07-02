<?php

namespace App\Services\FinancialAnalysis\Support;

final class RatioMath
{
    public static function divide(?string $numerator, ?string $denominator, int $scale = 4): ?string
    {
        if ($denominator === null || bccomp($denominator, '0', $scale) === 0) {
            return null;
        }

        return bcdiv($numerator ?? '0', $denominator, $scale);
    }

    public static function average(string $beginning, string $ending): string
    {
        return bcdiv(bcadd($beginning, $ending, 4), '2', 4);
    }

    public static function percent(?string $ratio, int $scale = 2): ?string
    {
        if ($ratio === null) {
            return null;
        }

        return bcmul($ratio, '100', $scale);
    }

    public static function formatPercent(?string $percent): ?string
    {
        return $percent === null ? null : number_format((float) $percent, 2).'%';
    }

    public static function formatRatio(?string $ratio): ?string
    {
        return $ratio === null ? null : number_format((float) $ratio, 2);
    }

    public static function toFloat(?string $value): ?float
    {
        return $value === null ? null : (float) $value;
    }
}
