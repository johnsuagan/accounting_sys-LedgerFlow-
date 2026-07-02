<?php

namespace App\Enums;

enum JournalEntrySource: string
{
    case Manual = 'manual';
    case Reversal = 'reversal';
    case System = 'system';
    case OpeningBalance = 'opening_balance';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
