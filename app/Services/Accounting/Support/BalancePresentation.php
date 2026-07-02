<?php

namespace App\Services\Accounting\Support;

use App\Enums\NormalBalance;

final class BalancePresentation
{
    /**
     * @return array{balance_amount: string, balance_side: string, debit_balance: string, credit_balance: string}
     */
    public static function present(string $signedBalance, NormalBalance $normalBalance): array
    {
        $isNegative = bccomp($signedBalance, '0', 4) === -1;
        $naturalSide = $normalBalance === NormalBalance::Debit ? 'DR' : 'CR';
        $balanceSide = $isNegative ? ($naturalSide === 'DR' ? 'CR' : 'DR') : $naturalSide;
        $balanceAmount = $isNegative ? bcmul($signedBalance, '-1', 4) : $signedBalance;

        return [
            'balance_amount' => $balanceAmount,
            'balance_side' => $balanceSide,
            'debit_balance' => $balanceSide === 'DR' ? $balanceAmount : '0.0000',
            'credit_balance' => $balanceSide === 'CR' ? $balanceAmount : '0.0000',
        ];
    }

    public static function signedMovement(NormalBalance $normalBalance, string $debit, string $credit): string
    {
        return $normalBalance === NormalBalance::Debit
            ? bcsub($debit, $credit, 4)
            : bcsub($credit, $debit, 4);
    }
}
