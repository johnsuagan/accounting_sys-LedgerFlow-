<?php

namespace App\Enums;

enum AuditAction: string
{
    case Created = 'created';
    case Updated = 'updated';
    case Deleted = 'deleted';
    case Restored = 'restored';
    case Posted = 'posted';
    case Reversed = 'reversed';
    case Cancelled = 'cancelled';
    case Closed = 'closed';
    case Locked = 'locked';
    case Opened = 'opened';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
