<?php

namespace App\Services\Accounting\Support;

use App\Enums\AccountType;

final class FinancialStatementMapper
{
    public static function forAccountType(AccountType $accountType): string
    {
        return match ($accountType) {
            AccountType::Revenue, AccountType::Expense => 'income_statement',
            default => 'statement_of_financial_position',
        };
    }

    public static function label(string $statement): string
    {
        return match ($statement) {
            'income_statement' => 'Income Statement',
            default => 'Statement of Financial Position',
        };
    }
}
