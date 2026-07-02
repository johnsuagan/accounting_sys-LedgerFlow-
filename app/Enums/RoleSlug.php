<?php

namespace App\Enums;

enum RoleSlug: string
{
    case SuperAdmin = 'super_admin';
    case Accountant = 'accountant';
    case Auditor = 'auditor';

    public function isReadOnly(): bool
    {
        return $this === self::Auditor;
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
