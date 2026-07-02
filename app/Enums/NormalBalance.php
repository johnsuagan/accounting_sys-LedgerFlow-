<?php

namespace App\Enums;

enum NormalBalance: string
{
    case Debit = 'debit';
    case Credit = 'credit';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
