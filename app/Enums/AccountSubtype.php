<?php

namespace App\Enums;

enum AccountSubtype: string
{
    case CurrentAsset = 'current_asset';
    case NonCurrentAsset = 'non_current_asset';
    case CurrentLiability = 'current_liability';
    case NonCurrentLiability = 'non_current_liability';
    case Equity = 'equity';
    case Revenue = 'revenue';
    case Expense = 'expense';

    public function accountType(): AccountType
    {
        return match ($this) {
            self::CurrentAsset, self::NonCurrentAsset => AccountType::Asset,
            self::CurrentLiability, self::NonCurrentLiability => AccountType::Liability,
            self::Equity => AccountType::Equity,
            self::Revenue => AccountType::Revenue,
            self::Expense => AccountType::Expense,
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
