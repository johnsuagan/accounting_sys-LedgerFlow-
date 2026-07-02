<?php

namespace App\Support;

use Illuminate\Support\Str;

class AuditRequestContext
{
    protected static ?string $requestId = null;

    public static function id(): string
    {
        if (static::$requestId === null) {
            static::$requestId = (string) Str::uuid();
        }

        return static::$requestId;
    }

    public static function set(?string $requestId): void
    {
        static::$requestId = $requestId;
    }

    public static function clear(): void
    {
        static::$requestId = null;
    }
}
