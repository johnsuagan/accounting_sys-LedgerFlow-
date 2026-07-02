<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class BalancedJournalLines implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value) || count($value) < 2) {
            $fail('A journal entry must contain at least two lines.');

            return;
        }

        $totalDebit = '0';
        $totalCredit = '0';

        foreach ($value as $index => $line) {
            if (! is_array($line)) {
                $fail('Each journal entry line must be a valid object.');

                return;
            }

            $debit = (string) ($line['debit'] ?? 0);
            $credit = (string) ($line['credit'] ?? 0);

            $hasDebit = bccomp($debit, '0', 4) === 1;
            $hasCredit = bccomp($credit, '0', 4) === 1;

            if ($hasDebit && $hasCredit) {
                $fail('Line '.($index + 1).' cannot contain both a debit and a credit.');

                return;
            }

            if (! $hasDebit && ! $hasCredit) {
                $fail('Line '.($index + 1).' must contain either a debit or a credit.');

                return;
            }

            if (bccomp($debit, '0', 4) === -1 || bccomp($credit, '0', 4) === -1) {
                $fail('Line '.($index + 1).' amounts cannot be negative.');

                return;
            }

            $totalDebit = bcadd($totalDebit, $debit, 4);
            $totalCredit = bcadd($totalCredit, $credit, 4);
        }

        if (bccomp($totalDebit, $totalCredit, 4) !== 0) {
            $fail('Total debits must equal total credits.');
        }
    }
}
